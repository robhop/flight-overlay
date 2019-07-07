import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";

const Canvas = require('canvas')

interface Frame {
    id: number
    paths: Path2D[]
}

export interface CanvasContext {
    canvas: any,
    strokeStyle: string
    lineWidth: number
    stroke(path: Path2D): void
}

export class Frameset {
    widht: number;
    height: number
    frames: Frame[];
    constructor(widht: number, height: number) {
        this.frames = new Array<Frame>()
        this.widht = widht
        this.height = height

    }

    addFrame(paths: Path2D[]) {
        this.frames.push({ id: this.frames.length, paths: paths })
    }

    addFrames(count: number) {
        for (let index = 0; index < count; index++) {
            this.frames.push({ id: this.frames.length, paths: [] })
        }
    }

    renderFrames(callback: (index: number, paths: Path2D[], ctx: CanvasContext) => void) {
        for (let frame of this.frames) {
            const canvas = Canvas.createCanvas(this.widht, this.height)
            const ctx = canvas.getContext('2d')
            callback(frame.id, frame.paths, ctx)
        }
    }
}
