"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Canvas = require('canvas');
function newFrame(a, widht, height) {
    var c = Canvas.createCanvas(widht, height);
    var f = {
        id: a.length,
        canvas: c,
        ctx: c.getContext('2d')
    };
    a.push(f);
    return f;
}
function newFrameSet(widht, height) {
    var a = new Array();
    return {
        frames: a,
        newFrame: function () { return newFrame(a, widht, height); }
    };
}
exports.newFrameSet = newFrameSet;
