const Canvas = require('canvas')


interface Frame {
    id: number
    canvas: any
    ctx: any
}


interface FrameSet {
    frames: Array<Frame>
    newFrame(): Frame
}

function newFrame(a: Array<Frame>, widht: number, height: number): Frame {
    const c = Canvas.createCanvas(widht, height)
    const f = {
        id: a.length,
        canvas: c,
        ctx: c.getContext('2d')
    }
    a.push(f)
    return f
}


export function newFrameSet(widht: number, height: number): FrameSet {
    const a = new Array<Frame>()
    return {
        frames: a,
        newFrame: () => newFrame(a, widht, height)
    }
}

