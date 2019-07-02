#!/usr/bin/env node
const fs = require('fs')
var ffmpeg = require('fluent-ffmpeg');
const IGCParser = require('igc-parser')
const argv = require('yargs') // eslint-disable-line
    .demandOption(['i', 's', 't'])
    .option('verbose', { alias: 'v', default: false })
    .option('s', { alias: 'source' })
    .option('t', { alias: 'target' })
    .option('i', { alias: 'igc' })
    .argv

console.log(argv)
const igcFile = IGCParser.parse(fs.readFileSync(argv.igc, 'utf8'));


ffmpeg.ffprobe(argv.source, (err, meta) => {
    if (err) throw new Error('Unable to probe file:' + argv.source)
    console.dir(meta)
})