const fs = require('fs');
const path = require('path');
const bufferToSpectogram = require('../');

const start = async () => {


    const wavFile = path.join(__dirname, './data/12_11_01-sound-espresso.wav');
    // const wavFile = path.join(__dirname, './data/sound-0001.wav');
    const spectrogramFile = path.join(__dirname, './output/spectogram.png');
    const buffer = fs.readFileSync(wavFile);

    try {

        let result = await bufferToSpectogram(buffer, spectrogramFile, {chunkTimeLength: 1000, isWav: true});

        result.forEach(item => {
            console.log(item.filename);
        });

    } catch (err) {
        console.log(err);
    }

};

start();
