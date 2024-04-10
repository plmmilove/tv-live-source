const cheerio = require("cheerio");
const fs = require("fs");

let html = fs.readFileSync('./tv.html', 'utf8')
console.log(html)

if(html.length === 0) {
    console.log('empty html')
    return
}

let $ = cheerio.load(html);
let map = new Map()
$('div.result').each((i, el) => {
    let name = $(el).children('div.channel').find('div:eq(0)').text().trim()
    let url = $(el).children('div.m3u8').find('td:eq(1)').text().trim()

    if(name.length === 0 || url.length === 0  || name.includes('画中画') || name.includes('单音轨') || name.includes('热门')) {
        return
    }

    let v = map.get(name) || []
    v.push(url)
    map.set(name, v)
})

const epg = require('./cypress/fixtures/epg.json')

let epgMap = epg.reduce((acc, o) => {
    acc.set(o.name, o.extinf);
    return acc;
}, new Map());

let resultM3u = '#EXTM3U\n'
let resultTxt = ''
if (map.size > 0) {
    Array.from(map.entries()).forEach((v) => {
        let extinf = epgMap.get(v[0]) || `#EXTINF:-1 tvg-id="" tvg-name="${v[0]}" tvg-logo="" group-title="未分类",${v[0]}`
        resultM3u += extinf + '\n'
        resultM3u += v[1] + '\n'

        resultTxt += v[0] + "," + v[1] + "\n"
    })

    fs.writeFile('./dist/tv.m3u', resultM3u, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('tv.m3u created.');
    });

    fs.writeFile('./dist/tv.txt', resultTxt, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('tv.txt created.');
    });
    fs.writeFileSync(`./dist/index.html`, new Date().toLocaleString())
}
