Cypress.Commands.add('getMulticastIps', () => {
    let ips = Cypress.env('multicast_ips')
    console.log(ips)
    let ipArray
    if (ips == null || ips.length === 0) {
        ipArray = cy.request('http://tonkiang.us/hoteliptv.php?s=' + encodeURIComponent('四川电信'))
            .then((response) => {
                return Cypress.$(response.body).find('div.result:lt(3) > div.channel > a').map((i, el) => {
                    return Cypress.$(el).text().trim()
                }).toArray()
            })
    } else {
        ipArray = JSON.parse(ips)
    }
    return ipArray
})