describe('TV List', () => {
    it('tv list', () => {
        cy.intercept('GET', 'https://pagead2.googlesyndication.com/**', {
            statusCode:200
        })

        cy.intercept('GET', 'https://ap.lijit.com/**', {
            statusCode:200
        })
        cy.visit('http://tonkiang.us/hoteliptv.php?s=' + encodeURIComponent('四川电信'))

        cy.get('div.result:lt(3) > div.channel > a').each(($el, index, $list) => {
            cy.intercept('GET', 'http://tonkiang.us/9dlist2.php?s=*&c=false').as('getList')
            cy.log($el.attr('href'))
            cy.visit('http://tonkiang.us/' + $el.attr('href'))
            cy.wait('@getList').then((intercept) => {
                cy.parseChannel(intercept.response.body, index)
            })
        })
    })
})