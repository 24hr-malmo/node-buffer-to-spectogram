const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');
const wavSpectro = require('wav-spectrogram');
const header = require('waveheader');
const zeroFill = require('zero-fill');

const defaultOptions = {
    sampleRate: 16000,
    channels: 1,
    height: 255,
    colorMap: 'jet',
    isWav: false,
    frameLengthMs: .1,
    frameStepMs: .05,
    chunkTimeLength: -1,
    nfft: 512,
};

const draw = (wavBuffer, img, options, filename) => new Promise((resolve, reject) => {

    wavSpectro.drawSpectrogram({arrayBuffer: wavBuffer, canvasElem: img, cmap: options.colorMap, frameLengthMs: options.frameLengthMs, frameStepMs: options.frameStepMs}, function () {
        PImage.encodePNGToStream(img, fs.createWriteStream(filename))
            .then(() => {
                resolve({
                    filename,
                    wavBuffer,
                });
            })
            .catch((err)=>{
                return reject(err);
            });
    });

});

const createSpectogram = async (buffer, imageFilename, options) => {

    options = {...defaultOptions, ...options};

    let results = [];

    if (options.isWav) {
        buffer = buffer.slice(44);
    }

    let chunkLength = buffer.length;

    if (options.chunkTimeLength !== -1) {
        let totalTime = buffer.length / (options.sampleRate * 2) * 1000;
        let chunkTime = totalTime / options.chunkTimeLength;
        chunkLength = buffer.length / chunkTime;
    }

    let index = 0;

    for ( let i = 0, ii = buffer.length; i < ii; i+= chunkLength ) {

        let chunk = buffer.slice(i, chunkLength + i);

        let time = (chunk.length) / (options.sampleRate * 2);

        let width = Math.round(time * 1000 / 53.571428571);
        let img = PImage.make(width, options.height);
        let ctx = img.getContext('2d');

        // Convert to WAV file by createing the 44 byte header and adding it to the begining of the bufffer)
        let h = header(chunk.length, { sampleRate: options.sampleRate, channels: options.channels });
        let wavBuffer = Buffer.concat([h, chunk]);

        if (options.chunkTimeLength !== -1) {
            let extention = path.extname(imageFilename);
            filename = imageFilename.replace(extention, '');
            filename = `${filename}-${zeroFill(5, index)}${extention}`;
        } else {
            filename = imageFilename;
        }

        // console.log(wavoptions.sampleRate * 2 / (options.chunkTimeLength / 1000));
        if (wavBuffer.length >= options.sampleRate * 2 / ( options.chunkTimeLength / 1000)) {
            let result = await draw(wavBuffer, img, options, filename);
            results.push(result);
            index++;
        }

    }

    return results;

}

module.exports = createSpectogram;
