import * as ffmpeg from 'fluent-ffmpeg'
import * as _ from 'lodash'


export function probe(fileName: string) {
    return new Promise((reseove, reject) => {
        ffmpeg.ffprobe(fileName, (err, meta) => {
            if (err || !meta) {
                reject("Unable to resolve " + fileName)
            }
            else {

                const t = meta.streams.filter((s) => s.codec_type == 'video').pop()
                reseove(t)
            }
        })
    })
}

