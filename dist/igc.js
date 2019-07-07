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
var IGC = /** @class */ (function () {
    function IGC(igcdata, height, width) {
        this.height = height;
        this.width = width;
        this.igcData = igcdata;
        this.padding = 10;
        var feature = geojson.parse({ line: this.igcData.fixes.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
        this.projection = d3.geoMercator().fitExtent([[this.padding, this.padding], [width - this.padding, height - this.padding]], feature);
    }
    IGC.prototype.getPath = function () {
        var feature = geojson.parse({ line: this.igcData.fixes.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
        var svg = d3.geoPath(this.projection)(feature);
        if (svg) {
            return new Path2D(svg);
        }
        else {
            return new Path2D();
        }
    };
    IGC.prototype.getAllPaths = function (callback) {
        var fullpath = this.getPath();
        for (var index = 1; index < this.igcData.fixes.length; index++) {
            var slice = this.igcData.fixes.slice(0, index);
            var feature = geojson.parse({ line: slice.map(function (f) { return [f.longitude, f.latitude]; }) }, { 'LineString': 'line' });
            var svg = d3.geoPath(this.projection)(feature);
            if (svg) {
                callback(new Path2D(svg), fullpath);
            }
            else {
                callback(new Path2D(), fullpath);
            }
        }
    };
    return IGC;
}());
exports.IGC = IGC;
function parseIGCFile(fileName) {
    return IGCParser.parse(fs_1.default.readFileSync(fileName, 'utf8'));
}
exports.parseIGCFile = parseIGCFile;
