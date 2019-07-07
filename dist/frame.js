"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Canvas = require('canvas');
var Frameset = /** @class */ (function () {
    function Frameset(widht, height) {
        this.frames = new Array();
        this.widht = widht;
        this.height = height;
    }
    Frameset.prototype.addFrame = function (paths) {
        this.frames.push({ id: this.frames.length, paths: paths });
    };
    Frameset.prototype.addFrames = function (count) {
        for (var index = 0; index < count; index++) {
            this.frames.push({ id: this.frames.length, paths: [] });
        }
    };
    Frameset.prototype.renderFrames = function (callback) {
        for (var _i = 0, _a = this.frames; _i < _a.length; _i++) {
            var frame = _a[_i];
            var canvas = Canvas.createCanvas(this.widht, this.height);
            var ctx = canvas.getContext('2d');
            callback(frame.id, frame.paths, ctx);
        }
    };
    return Frameset;
}());
exports.Frameset = Frameset;
