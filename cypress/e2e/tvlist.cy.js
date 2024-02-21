const cheerio = require("cheerio")

describe('TV List', () => {
    it('tv list', () => {
        interceptUnusedRequest()

        cy.wrap(["http://tonkiang.us/hotellist.html?s=171.223.215.229:4000"]).each((url) => {
            cy.intercept('GET', 'http://tonkiang.us/9dlist2.php?s=*&c=false').as('getList')
            cy.visit(url)
            cy.wait('@getList')
        }).get('#hiddenresult > div.tables > div.result')
            .each(($el) => {
                let name = $el.children('div.channel').find('div:eq(0)').text().trim()
                let url = $el.children('div.m3u8').find('td:eq(1)').text().trim()
                if (name.length === 0 || url.length === 0 || Cypress.env('excludeChannels').some(v => name.includes(v))) {
                    return
                }
                cy.log(name, url)
            })
        // cy.request('http://tonkiang.us/hoteliptv.php?s=' + encodeURIComponent('四川电信')).then((response) => {
        //     let $ = cheerio.load(response.body);
        //     return $('div.result:lt(2) > div.channel > a').map((i, el) => {
        //         return 'http://tonkiang.us/' + $(el).attr('href')
        //     })
        // }).each((url) => {
        //     cy.intercept('GET', 'http://tonkiang.us/9dlist2.php?s=*&c=false').as('getList')
        //     cy.visit(url)
        //     return cy.wait('@getList').then((intercept) => {
        //         return cy.parseChannel(intercept.response.body)
        //     }).then((result) => {
        //         cy.writeFile(`dist/tv.m3u`, result)
        //     })
        // })
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

    // cy.intercept('GET', 'https://*.lijit.com/**', {
    //     statusCode: 200
    // })

    // cy.intercept('https://*.s-onetag.com/**', {
    //     statusCode: 200
    // })

    // cy.intercept('https://*.crwdcntrl.net/**', {
    //     statusCode: 200
    // })
}