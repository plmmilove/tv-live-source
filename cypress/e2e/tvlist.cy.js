const cheerio = require("cheerio")
const epg = require('../fixtures/epg.json')

describe('TV List', () => {
    it('tv list', () => {
        interceptUnusedRequest()

        let epgMap = epg.reduce((acc, o) => {
            acc.set(o.name, o.extinf);
            return acc;
        }, new Map());

        let srcList = []
        if (Cypress.env('multicast_ips')) {
            srcList = JSON.parse(Cypress.env('multicast_ips'))
        } else {
            srcList = cy.request('http://tonkiang.us/hoteliptv.php?s=' + encodeURIComponent('四川电信'))
                .then((response) => {
                    let $ = cheerio.load(response.body);
                    return $('div.result:lt(3) > div.channel > a').map((i, el) => {
                        return $(el).text().trim()
                    }).toArray()
                })
        }

        srcList.map((src, idx) => {
            let url = 'http://tonkiang.us/hotellist.html?s=' + src
            cy.intercept('GET', 'http://tonkiang.us/9dlist2.php?s=*&c=false').as('getList')
            cy.visit(url)
            cy.wait('@getList')

            let map = new Map()
            cy.get('#hiddenresult > div.tables > div.result')
                .each(($el) => {
                    let name = $el.children('div.channel').find('div:eq(0)').text().trim()
                    let url = $el.children('div.m3u8').find('td:eq(1)').text().trim()
                    if (name.length === 0 || url.length === 0 || Cypress.env('excludeChannels').some(v => name.includes(v))) {
                        return
                    }
                    map.set(name, url)
                }).then(() => {
                let result = '#EXTM3U\n'
                if (map.size > 0) {
                    Array.from(map.entries()).forEach((v) => {
                        let extinf = epgMap.get(v[0]) || `#EXTINF:-1 tvg-id="" tvg-name="${v[0]}" tvg-logo="" group-title="未分类",${v[0]}`
                        result += extinf + '\n'
                        result += v[1] + '\n'
                    })

                    cy.writeFile(`dist/tv.m3u`, result)
                }
            })
        })

        cy.writeFile(`dist/index.html`, new Date())
    })
})

function interceptUnusedRequest() {
    cy.intercept('GET', 'https://*.googlesyndication.com/**', {
        statusCode: 200
    })

    // cy.intercept('GET', 'https://*.dtscout.com/**', {
    //     statusCode: 200
    // })
    //
    // cy.intercept('GET', 'https://*.dtscdn.com/**', {
    //     statusCode: 200
    // })

    cy.intercept('GET', 'https://*.lijit.com/**', {
        statusCode: 200
    })

    // cy.intercept('https://*.s-onetag.com/**', {
    //     statusCode: 200
    // })

    // cy.intercept('https://*.crwdcntrl.net/**', {
    //     statusCode: 200
    // })
}
