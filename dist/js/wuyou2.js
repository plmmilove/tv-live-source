const axios = require("axios");
const cheerio = require('cheerio');

module.exports = {
    platform: "无忧",
    version: "1.0.0",
    cacheControl: "no-cache",
    cache: new Map(),
    async search(query, page, type) {
        if (type === "music") {
            query = encodeURIComponent(query)

            const searchResults = await this.getMusicList(`https://www.qeecc.com/so/${query}/${page}.html`)
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
        const data = await this.getPostData(musicItem.id)

        return {
            url: data.url,
            quality: "standard"
        };
    },

    async getLyric(musicItem) {
        const pd = await this.getPostData(musicItem.id)
        const cid = pd.lkid
        if(!cid) {
            return null
        }

        const resp = await fetch(`https://js.eev3.com/lrc.php?cid=${cid}`, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "zh-CN,zh;q=0.9,ko;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });

        let data = await resp.text()
        data = JSON.parse(data)

        return {
            rawLrc: data.lrc,
        }
    },

    async getRecommendSheetTags() {
        const rawHtml = (
          await axios.get(`https://www.qeecc.com/playtype/index.html`)
        ).data;

        const $ = cheerio.load(rawHtml);
        const pinned = [];
        const resultElements = $('div.ilingku_fl > li > a');
        resultElements.each((index, element) => {
            const e = $(element)

            const href = e.attr('href');
            const title = e.text();
            const id = href.slice(10, -5)

            pinned.push({
                id,
                title,
            })
        })

        return {
            pinned,
        }
    },

    async getRecommendSheetsByTag(tag, page) {
        let url = `https://www.qeecc.com/playtype/${tag.id}/${page}.html`

        const rawHtml = (
          await axios.get(url)
        ).data;

        const $ = cheerio.load(rawHtml);

        const list = [];
        const resultElements = $('div.video_list > ul.play > li');

        for (let i = 0; i < resultElements.length && i< 5; i++) {
            const e = $(resultElements[i]);

            const href = e.find('div.pic > a').attr('href');
            const id = href.slice(10, -5)

            const title = e.find('div.name > a').attr('title');
            const coverImg = e.find('div.pic > a > img').attr('src');

            const musicList = await this.getMusicList(`https://www.qeecc.com${href}`)
            list.push({
                id,
                title,
                coverImg,
                artwork: coverImg,
                musicList,
            })
        }

        return {
            isEnd: true,
            data: list
        }
    },

    async getMusicList(url) {
        const rawHtml = (
          await axios.get(url)
        ).data;

        const $ = cheerio.load(rawHtml);
        const list = [];
        const resultElements = $('.play_list > ul > li > div.name');
        resultElements.each((index, element) => {
            const e = $(element).find('a');

            const href = e.attr('href');
            const txt = e.text();

            const id = href.slice(6, -5)
            const title = txt.substring(txt.indexOf('《') + 1, txt.indexOf('》')).trim()
            const artist = txt.substring(0, txt.indexOf('《')).trim()

            list.push({
                id,
                title,
                artist,
                duration: 300,
                platform: this.platform,
            })
        });

        return list
    },

    async getPostData(id) {
        let data = this.cache.get(id)
        if (!data) {
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
                    "Referer": `https://www.qeecc.com/song/${id}.html`
                },
                "body": "id=" + id + "&type=music",
                "method": "POST"
            });

            data = await resp.text()
            data = JSON.parse(data)

            if (this.cache.size === 100) {
                this.cache.delete(this.cache.keys().next().value)
            }
            this.cache.set(id, data)
        }
        return data
    },
};
