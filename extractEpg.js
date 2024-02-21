const fs = require('fs');

const m3uFile = 'dist/epg.m3u';
const jsonFile = 'cypress/fixtures/epg.json';

const channels = [];

fs.readFile(m3uFile, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const lines = data.split('\n');

    for (let line of lines) {
        if (line.startsWith('#EXTINF')) {
            const name = line.split(',').at(-1).trim()
            channels.push({name: name, extinf: line});
        }
    }

    fs.writeFile(jsonFile, JSON.stringify(channels, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Conversion completed. JSON file created.');
    });
});