import fs from "fs"
import { Feature } from "geojson";
const IGCParser = require('igc-parser')
const geojson = require('geojson')
import * as d3 from 'd3-geo'

interface IGCData {
    fixes :any[]
}

require('canvas-5-polyfill')
export function parseIGCFile(fileName: string): IGCData {
    return IGCParser.parse(fs.readFileSync(fileName, 'utf8'))
}

export function getPath(igcData: IGCData, height: number, width: number): any {
    const feature = geojson.parse({ line: igcData.fixes.map((f: any) => { return [f.longitude, f.latitude] }) }, { 'LineString': 'line' })
    const projection = d3.geoMercator().fitSize([width, height], feature);
    const svg = d3.geoPath(projection)(feature)
    if (svg) {
        return new Path2D(svg)
    }
    else {
        return null
    }
}