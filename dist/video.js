"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ffmpeg = __importStar(require("fluent-ffmpeg"));
function probe(fileName) {
    return new Promise(function (reseove, reject) {
        ffmpeg.ffprobe(fileName, function (err, meta) {
            if (err || !meta) {
                reject("Unable to resolve " + fileName);
            }
            else {
                var t = meta.streams.filter(function (s) { return s.codec_type == 'video'; }).pop();
                reseove(t);
            }
        });
    });
}
exports.probe = probe;
