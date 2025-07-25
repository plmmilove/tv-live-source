const axios = require("axios");
const cheerio = require('cheerio');

module.exports = {
    platform: "无忧", // 插件名
    version: "1.0.0", // 版本号
    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        if (type === "music") {
            // 我们能搜索的只有音乐，因此判断下类型
            // 获取网站的html
            const rawHtml = (
                await axios.get(`https://www.qeecc.com/so/${query}/${page}.html`)
            ).data;

            // 接下来解析html 
            const $ = cheerio.load(rawHtml);
            // 存储搜索结果 
            const searchResults = [];
            // 获取所有的结果
            const resultElements = $('.play_list > ul > li > div.name');
            // 解析每一个结果
            resultElements.each((index, element) => {
                const e = $(element).find('a');

                const href = e.attr('href');
                const txt = e.text();

                // id
                const id = href.slice(6, -5)
                // 音频名
                const title = txt.substring(txt.indexOf('《') + 1, txt.indexOf('》')).trim()
                // 作者
                const artist = txt.substring(0, txt.indexOf('《')).trim()
                // 专辑封面
                const artwork = ''
                // 音源
                const url = 'https://www.qeecc.com' + href
                // 专辑名，这里就随便写个了，不写也没事
                const album = '';

                searchResults.push({
                    // 一定要有一个 id 字段
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

        // 接下来解析html
        const $ = cheerio.load(rawHtml);
        const url = $('#player > audio').attr('src')

        return {
            url: url,
            quality: "standard",
        };
    },
};
