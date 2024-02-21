const cheerio = require("cheerio")
const epg = require('../fixtures/epg.json')


Cypress.Commands.add('parseChannel', (html) => {
    let $ = cheerio.load(html);
    let map = new Map()
    let epgMap = new Map()

    epg.forEach(v => {
        epgMap.set(v.name, v.extinf)
    })

    $('div.result').each((i, el) => {
        let name = $(el).children('div.channel').find('div:eq(0)').text().trim()
        let url = $(el).children('div.m3u8').find('td:eq(1)').text().trim()

        if (name.length === 0 || url.length === 0 || Cypress.env('excludeChannels').some(v => name.includes(v))) {
            return
        }

        map.set(name, url)
    })

    let result = '#EXTM3U\n'
    Array.from(map.entries()).forEach((v) => {
        cy.log(v[0])
        cy.log(v[0].length)
        result += epgMap.get(v[0])
        result += v[0] + ',' + v[1] + '\n'
    })

    return result
})