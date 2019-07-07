import fs from "fs"
const IGCParser = require('igc-parser')
const geojson = require('geojson')
import * as d3 from 'd3-geo'
require('canvas-5-polyfill')
interface IGCData {
    fixes: any[]
}

export class IGC {
    igcData: IGCData
    padding: number
    height: number;
    width: number;
    projection: d3.GeoProjection;
    constructor(igcdata: IGCData, height: number, width: number) {
        this.height = height
        this.width = width
        this.igcData = igcdata
        this.padding = 10
        const feature = geojson.parse({ line: this.igcData.fixes.map((f: any) => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })
        this.projection = d3.geoMercator().fitExtent([[this.padding, this.padding], [width - this.padding, height - this.padding]], feature);
    }

    getPath(): Path2D {
        const feature = geojson.parse({ line: this.igcData.fixes.map((f: any) => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })
        const svg = d3.geoPath(this.projection)(feature)
        if (svg) {
            return new Path2D(svg)
        }
        else {
            return new Path2D()
        }
    }

    getAllPaths(callback: (path: Path2D, fullpath: Path2D) => void) {
        var fullpath = this.getPath()
        for (let index = 1; index < this.igcData.fixes.length; index++) {
            const slice = this.igcData.fixes.slice(0, index)
            const feature = geojson.parse({ line: slice.map((f: any) => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })
            const svg = d3.geoPath(this.projection)(feature)
            if (svg) {
                callback(new Path2D(svg), fullpath)
            }
            else {
                callback(new Path2D(), fullpath)
            }
        }
    }

}


export function parseIGCFile(fileName: string): any {
    return IGCParser.parse(fs.readFileSync(fileName, 'utf8'))
}

