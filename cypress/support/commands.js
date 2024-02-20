const cheerio = require("cheerio");

Cypress.Commands.add('parseChannel', (html, index) => {
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

    let result = ''
    Array.from(map.entries()).forEach((v) => {
        result += v[0] + ',' + v[1].join(',') + '\n'
    })

    cy.writeFile(`dist/tv${index}.m3u`, result)
})