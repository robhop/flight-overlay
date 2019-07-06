#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require('moment');
var model = require('./videomodel');
var argv = require('yargs') // eslint-disable-line
    .demandOption(['i', 's'])
    .option('verbose', { alias: 'v', default: false })
    .option('s', { alias: 'source' })
    .option('t', { alias: 'target' })
    .option('i', { alias: 'igc' })
    .option('noImages')
    .option('noCleanup')
    .option('png')
    .option('p', { alias: 'padding', default: '00:00:00' })
    .argv;
console.log(argv);
var padding = moment.duration(argv.padding).asSeconds();
console.log(padding);
var frame_1 = require("./frame");
var fs = frame_1.newFrameSet(200, 200);
var f = fs.newFrame();
var f2 = fs.newFrame();
var igc_1 = require("./igc");
var igc = igc_1.parseIGCFile(argv.igc);
var p = igc_1.getPath(igc, 200, 200);
var video_1 = require("./video");
video_1.probe(argv.source)
    .then(function (v) { return console.log(v); })
    .catch(function (err) { return console.log(err); });
// model(argv.source)
//     .then((result :any) => result.probe())
//     .then((result :any) => result.loadIGC(argv.igc))
//     .then((result :any) => result.generateFullPath(argv.png))
//     .then((result :any) => result.generateImages(!argv.noImages, padding))
//     .then((result :any) => result.render(argv.target))
//     .then((result :any) => result.printInfo())
//     .then((result :any) => result.cleanup(!argv.noCleanup))
//     .catch((err :any) => console.log(err))
