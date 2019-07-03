const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash')
const IGCParser = require('igc-parser')
const fs = require('fs')
const Canvas = require('canvas')
const d3 = require('d3-geo')
const GeoJSON = require('geojson');
var tmp = require('tmp');
require('canvas-5-polyfill')

function VideoModel(file) {
    if (!(this instanceof VideoModel)) {
        return new VideoModel(file);
    }
    this.file = file
    this.height = 0
    this.width = 0

    return Promise.resolve(this)
}


VideoModel.prototype.printInfo = function () {
    const self = this
    console.log("Videoinfo is like this " + this.height)
    console.dir(this)
    return Promise.resolve(self)
}


VideoModel.prototype.probe = function () {
    const self = this
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(self.file, (err, meta) => {
            if (err || !meta) {
                reject('Unable to probe file:' + self.file)
            } else {
                const t = _.chain(meta.streams).first({ codec_type: 'video' }).pick(['height', 'width']).value()
                self.height = t.height
                self.width = t.width
                resolve(self)
            }
        })
    });
}


VideoModel.prototype.loadIGC = function (fileName) {
    const self = this
    this.igcFile = IGCParser.parse(fs.readFileSync(fileName, 'utf8'))
    let data = GeoJSON.parse({ line: self.igcFile.fixes.map(f => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })
    let projection = d3.geoMercator().fitSize([this.width, this.height], data);
    let path = d3.geoPath(projection)
    this.path = path
    return Promise.resolve(this)
}


VideoModel.prototype.generateFullPath = function (file) {
    const self = this;
    let data = GeoJSON.parse({ line: self.igcFile.fixes.map(f => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })

    let svg = new Path2D(self.path(data))

    const canvas = Canvas.createCanvas(self.width, self.height)
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = 'white'
    ctx.globalAlpha = 0.3
    ctx.lineWidth = 3
    ctx.stroke(svg)
    self.ctxFullPath = ctx
    if (file)
        fs.writeFileSync(file, canvas.toBuffer())

    return Promise.resolve(this);

}


VideoModel.prototype.generateImages = function (doIt, padding) {
    if (!doIt) return Promise.resolve(this)
    const self = this
    return new Promise((resolve, reject) => {

        tmp.dir({ unsafeCleanup: true }, function _tempDirCreated(err, path, cleanup) {
            if (err) return reject(err);

            self.cleanup = cleanup
            self.tmppath = path

            let frame = 0
            const blank = Canvas.createCanvas(self.width, self.height)
            for (let index = 0; index <= padding; index++) {
                frame = index

                fs.writeFileSync(self.tmppath + '/frame' + ("00000" + frame).slice(-6) + '.png', blank.toBuffer())
            }

            for (let index = 0; index < self.igcFile.fixes.length; index++) {
                if (index == 0) continue
                frame++
                var points = self.igcFile.fixes.slice(0, index)

                let d = GeoJSON.parse({ line: points.map(f => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })
                var svg = self.path(d)
                var p = new Path2D(svg)

                const canvas = Canvas.createCanvas(self.width, self.height)
                const ctx = canvas.getContext('2d')
                ctx.putImageData(self.ctxFullPath.getImageData(0, 0, self.width, self.height), 0, 0)
                ctx.globalAlpha = 1
                ctx.lineWidth = 1
                ctx.strokeStyle = 'red'
                ctx.stroke(p)

                fs.writeFileSync(self.tmppath + '/frame' + ("00000" + frame).slice(-6) + '.png', canvas.toBuffer())
            }
            fs.writeFileSync(self.tmppath + '/frame' + ("00000" + (frame + 1)).slice(-6) + '.png', blank.toBuffer())
            resolve(self)
        })
    })
}


VideoModel.prototype.render = function (file) {
    if (!file) return Promise.resolve(this)
    const self = this
    self.outFile = file
    return new Promise((resolve, reject) => {

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
                resolve(self)
            })
            .save(file)

    })
}



VideoModel.prototype.cleanup = function (doIt) {
    if (!doIt) return Promise.resolve(this)
    const self = this
    this.cleanup()
    return Promise.resolve(this)
}

module.exports = VideoModel