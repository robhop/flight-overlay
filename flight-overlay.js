#!/usr/bin/env node
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash')
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

model(argv.source)
    .then((result) => result.probe())
    .then((result) => result.loadIGC(argv.igc))
    .then((result) => result.generateFullPath(argv.png))
    .then((result) => result.generateImages(!argv.noImages, padding))
    .then((result) => result.render(argv.target))
    .then((result) => result.printInfo())
    .then((result) => result.cleanup(!argv.noCleanup))
    .catch((err) => console.log(err))
