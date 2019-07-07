#!/usr/bin/env node
import * as fs from 'fs'
import * as moment from 'moment'
import * as yargs from 'yargs' // eslint-disable-line
const argv = yargs
    .option('verbose', { alias: 'v', default: false })
    .option('s', { alias: 'source', type: "string", demandOption: true })
    .option('t', { alias: 'target' })
    .option('i', { alias: 'igc', type: "string", demandOption: true })
    .option('p', { alias: 'padding', default: '00:00:00' })
    .demandOption(['i', 's'])
    .argv

import { probe } from './video'
import { parseIGCFile, IGC } from "./igc"
import { Frameset, CanvasContext } from './frame'
console.log(argv.i)

const padding = moment.duration(argv.p).asSeconds()
console.log(padding)

probe(argv.s)
    .then(v => {
        const frameset = new Frameset(v.width, v.height)
        const igc = new IGC(parseIGCFile(argv.i), v.height, v.width)
        frameset.addFrames(padding)
        igc.getAllPaths((path, fullpath) => {
            frameset.addFrame([path, fullpath])
        });
        frameset.renderFrames((index: number, paths: Path2D[], ctx: CanvasContext) => {
            console.log(index)
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.stroke(paths[1])
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 2
            ctx.stroke(paths[0])
            fs.writeFileSync('png/out' + index + '.png', ctx.canvas.toBuffer())
        })
    })
    .catch(err => console.log(err))


