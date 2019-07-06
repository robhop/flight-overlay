"use strict";
//@ts-check
var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
var IGCParser = require('igc-parser');
var fs = require('fs');
var Canvas = require('canvas');
var d3 = require('d3-geo');
var GeoJSON = require('geojson');
var tmp = require('tmp');
require('canvas-5-polyfill');
function VideoModel(file) {
    if (!(this instanceof VideoModel)) {
        return new VideoModel(file);
    }
    this.file = file;
    this.height = 0;
    this.width = 0;
    this.ctxFullPath = null;
    this.tmppath = null;
    this.outFile = null;
    this.cleanupfunc = null;
    return Promise.resolve(this);
}
VideoModel.prototype.printInfo = function () {
    var self = this;
    console.log("Videoinfo is like this " + this.height);
    console.dir(this);
    return Promise.resolve(self);
};
VideoModel.prototype.probe = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        ffmpeg.ffprobe(self.file, function (err, meta) {
            if (err || !meta) {
                reject('Unable to probe file:' + self.file);
            }
            else {
                var t = _.chain(meta.streams).first({ codec_type: 'video' }).pick(['height', 'width']).value();
                self.height = t.height;
                self.width = t.width;
                resolve(self);
            }
        });
    });
};
VideoModel.prototype.loadIGC = function (fileName) {
    var self = this;
    this.igcFile = IGCParser.parse(fs.readFileSync(fileName, 'utf8'));
    var data = GeoJSON.parse({ line: self.igcFile.fixes.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
    var projection = d3.geoMercator().fitSize([this.width, this.height], data);
    var path = d3.geoPath(projection);
    this.path = path;
    return Promise.resolve(this);
};
VideoModel.prototype.generateFullPath = function (file) {
    var self = this;
    var data = GeoJSON.parse({ line: self.igcFile.fixes.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
    var svg = new Path2D(self.path(data));
    var canvas = Canvas.createCanvas(self.width, self.height);
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 3;
    ctx.stroke(svg);
    self.ctxFullPath = ctx;
    if (file)
        fs.writeFileSync(file, canvas.toBuffer());
    return Promise.resolve(this);
};
VideoModel.prototype.generateImages = function (doIt, padding) {
    if (!doIt)
        return Promise.resolve(this);
    var self = this;
    return new Promise(function (resolve, reject) {
        tmp.dir({ unsafeCleanup: true }, function _tempDirCreated(err, path, cleanup) {
            if (err)
                return reject(err);
            self.cleanupfunc = cleanup;
            self.tmppath = path;
            var frame = 0;
            var blank = Canvas.createCanvas(self.width, self.height);
            for (var index = 0; index <= padding; index++) {
                frame = index;
                fs.writeFileSync(self.tmppath + '/frame' + ("00000" + frame).slice(-6) + '.png', blank.toBuffer());
            }
            for (var index = 0; index < self.igcFile.fixes.length; index++) {
                if (index == 0)
                    continue;
                frame++;
                var points = self.igcFile.fixes.slice(0, index);
                var d = GeoJSON.parse({ line: points.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
                var svg = self.path(d);
                var p = new Path2D(svg);
                var canvas = Canvas.createCanvas(self.width, self.height);
                var ctx = canvas.getContext('2d');
                ctx.putImageData(self.ctxFullPath.getImageData(0, 0, self.width, self.height), 0, 0);
                ctx.globalAlpha = 1;
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'red';
                ctx.stroke(p);
                fs.writeFileSync(self.tmppath + '/frame' + ("00000" + frame).slice(-6) + '.png', canvas.toBuffer());
            }
            fs.writeFileSync(self.tmppath + '/frame' + ("00000" + (frame + 1)).slice(-6) + '.png', blank.toBuffer());
            resolve(self);
        });
    });
};
VideoModel.prototype.render = function (file) {
    if (!file)
        return Promise.resolve(this);
    var self = this;
    self.outFile = file;
    return new Promise(function (resolve, reject) {
        ffmpeg(self.file)
            .addInput(self.tmppath + '/frame%06d.png')
            .inputFPS(1)
            .complexFilter([
            {
                filter: 'overlay', options: { x: 0, y: 0 }
            }
        ])
            .on('error', function (err, stdout, stderr) {
            reject('Cannot process video: ' + err.message);
        })
            .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
            .on('end', function () {
            resolve(self);
        })
            .save(file);
    });
};
VideoModel.prototype.cleanup = function (doIt) {
    if (!doIt)
        return Promise.resolve(this);
    var self = this;
    self.cleanupfunc();
    return Promise.resolve(this);
};
module.exports = VideoModel;
