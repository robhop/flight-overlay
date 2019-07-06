#!/usr/bin/env node
const moment = require('moment')
const model = require('./videomodel')
const argv = require('yargs') // eslint-disable-line
    .demandOption(['i', 's'])
    .option('verbose', { alias: 'v', default: false })
    .option('s', { alias: 'source' })
    .option('t', { alias: 'target' })
    .option('i', { alias: 'igc' })
    .option('noImages')
    .option('noCleanup')
    .option('png')
    .option('p', { alias: 'padding', default: '00:00:00' })
    .argv

console.log(argv)

const padding = moment.duration(argv.padding).asSeconds()

console.log(padding)

import { newFrameSet } from './frame'


let fs = newFrameSet(200, 200)
let f = fs.newFrame()
let f2 = fs.newFrame()

import { parseIGCFile, getPath } from "./igc"
const igc = parseIGCFile(argv.igc)

const p = getPath(igc,200, 200)



import {probe} from './video'

probe(argv.source)
    .then(v => console.log(v))
    .catch(err => console.log(err))
// model(argv.source)
//     .then((result :any) => result.probe())
//     .then((result :any) => result.loadIGC(argv.igc))
//     .then((result :any) => result.generateFullPath(argv.png))
//     .then((result :any) => result.generateImages(!argv.noImages, padding))
//     .then((result :any) => result.render(argv.target))
//     .then((result :any) => result.printInfo())
//     .then((result :any) => result.cleanup(!argv.noCleanup))
//     .catch((err :any) => console.log(err))
