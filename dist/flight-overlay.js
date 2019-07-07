#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var moment = __importStar(require("moment"));
var yargs = __importStar(require("yargs")); // eslint-disable-line
var argv = yargs
    .option('verbose', { alias: 'v', default: false })
    .option('s', { alias: 'source', type: "string", demandOption: true })
    .option('t', { alias: 'target' })
    .option('i', { alias: 'igc', type: "string", demandOption: true })
    .option('p', { alias: 'padding', default: '00:00:00' })
    .demandOption(['i', 's'])
    .argv;
var video_1 = require("./video");
var igc_1 = require("./igc");
var frame_1 = require("./frame");
console.log(argv.i);
var padding = moment.duration(argv.p).asSeconds();
console.log(padding);
video_1.probe(argv.s)
    .then(function (v) {
    var frameset = new frame_1.Frameset(v.width, v.height);
    var igc = new igc_1.IGC(igc_1.parseIGCFile(argv.i), v.height, v.width);
    frameset.addFrames(padding);
    igc.getAllPaths(function (path, fullpath) {
        frameset.addFrame([path, fullpath]);
    });
    frameset.renderFrames(function (index, paths, ctx) {
        console.log(index);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke(paths[1]);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke(paths[0]);
        fs.writeFileSync('png/out' + index + '.png', ctx.canvas.toBuffer());
    });
})
    .catch(function (err) { return console.log(err); });
