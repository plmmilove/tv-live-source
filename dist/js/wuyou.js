const axios = require("axios");
const cheerio = require('cheerio');

module.exports = {
    platform: "无忧",
    version: "1.0.0",
    cacheControl: "no-store",
    async search(query, page, type) {
        if (type === "music") {
            const rawHtml = (
                await axios.get(`https://www.qeecc.com/so/${query}/${page}.html`)
            ).data;

            const $ = cheerio.load(rawHtml);
            const searchResults = [];
            const resultElements = $('.play_list > ul > li > div.name');
            resultElements.each((index, element) => {
                const e = $(element).find('a');

                const href = e.attr('href');
                const txt = e.text();

                const id = href.slice(6, -5)
                const title = txt.substring(txt.indexOf('《') + 1, txt.indexOf('》')).trim()
                const artist = txt.substring(0, txt.indexOf('《')).trim()
                const artwork = ''
                const url = 'https://www.qeecc.com' + href
                const album = '';

                searchResults.push({
                    id,
                    title,
                    artist,
                    artwork,
                    album,
                    url
                })
            });
            return {
                isEnd: true,
                data: searchResults
            }
        }
    },
    async getMediaSource(musicItem, quality) {
        const rawHtml = (
          await axios.get(musicItem.url)
        ).data;

        const $ = cheerio.load(rawHtml);
        const url = $('#player > audio').attr('src')

        return {
            url: url,
            quality: "standard"
        };
    },
};
