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

                searchResults.push({
                    id,
                    title,
                    artist,
                })
            });
            return {
                isEnd: false,
                data: searchResults
            }
        }
    },

    async getMusicInfo(musicBase) {
        const rawHtml = (
            await axios.get(`https://www.qeecc.com/song/${musicBase.id}.html`)
        ).data

        const $ = cheerio.load(rawHtml);
        const cover = $("#mcover").attr('src')

        return {
            duration: 300,
            /** 专辑封面图 */
            artwork: cover,
        }
    },

    async getMediaSource(musicItem, quality) {
        const resp = await fetch("https://www.qeecc.com/js/play.php", {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "zh-CN,zh;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "Referer": `https://www.qeecc.com/song/${musicItem.id}.html`
            },
            "body": "id=" + musicItem.id + "&type=music",
            "method": "POST"
        });

        let data = await resp.text()

        data = JSON.parse(data)

        return {
            url: data.url,
            quality: "standard"
        };
    },
};
