#!/usr/bin/env node
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash')
const model = require('./videomodel')
const argv = require('yargs') // eslint-disable-line
    .demandOption(['i', 's', 't'])
    .option('verbose', { alias: 'v', default: false })
    .option('s', { alias: 'source' })
    .option('t', { alias: 'target' })
    .option('i', { alias: 'igc' })
    .argv

console.log(argv)

model(argv.source)
    .then((result) => result.probe())
    .then((result) => result.loadIGC(argv.igc))
    .then((result) => result.generateImages())
    .then((result) => result.render(argv.target))
    .then((result) => result.printInfo())
    .then((result) => result.cleanup())
    .catch((err) => console.log(err))
