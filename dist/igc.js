"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var IGCParser = require('igc-parser');
var geojson = require('geojson');
var d3 = __importStar(require("d3-geo"));
require('canvas-5-polyfill');
function parseIGCFile(fileName) {
    return IGCParser.parse(fs_1.default.readFileSync(fileName, 'utf8'));
}
exports.parseIGCFile = parseIGCFile;
function getPath(igcData, height, width) {
    var feature = geojson.parse({ line: igcData.fixes.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
    var projection = d3.geoMercator().fitSize([width, height], feature);
    var svg = d3.geoPath(projection)(feature);
    if (svg) {
        return new Path2D(svg);
    }
    else {
        return null;
    }
}
exports.getPath = getPath;
