const cheerio = require("cheerio");

let html = process.env.html || ''
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

const epg = require('./fixtures/epg.json')
const fs = require("fs");
let epgMap = epg.reduce((acc, o) => {
    acc.set(o.name, o.extinf);
    return acc;
}, new Map());


let result = '#EXTM3U\n'
if (map.size > 0) {
    Array.from(map.entries()).forEach((v) => {
        let extinf = epgMap.get(v[0]) || `#EXTINF:-1 tvg-id="" tvg-name="${v[0]}" tvg-logo="" group-title="未分类",${v[0]}`
        result += extinf + '\n'
        result += v[1] + '\n'
    })

    fs.writeFile('./dist/tv.m3u', result, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('tv.m3u created.');
    });
    fs.writeFileSync(`./dist/index.html`, new Date().toLocaleString())
}
