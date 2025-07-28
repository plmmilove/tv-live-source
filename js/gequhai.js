const axios = require("axios");
const cheerio = require('cheerio');
const querystring = require('querystring');

module.exports = {
    platform: "歌曲海", // 插件名
    version: "1.0.0", // 版本号
    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        if (type === "music") {
            // 我们能搜索的只有音乐，因此判断下类型
            // 获取网站的html
            query = querystring.escape(query)
            const rawHtml = (
                await axios.get(`https://www.gequhai.com/s/${query}`)
            ).data;

            // 接下来解析html 
            const $ = cheerio.load(rawHtml);
            // 存储搜索结果 
            const searchResults = [];
            // 获取所有的结果
            const resultElements = $('#myTables').find("tbody > tr");
            // 解析每一个结果
            resultElements.each((index, element) => {
                const tr1 = $(element).find('td:eq(1) > a');
                const tr2 = $(element).find('td:eq(2)');

                const href = tr1.attr('href')

                // id
                const id = href.slice(6)
                // 音频名
                const title = tr1.text().trim()
                // 作者
                const artist = tr2.text().trim()
                // 专辑封面
                const artwork = ''
                // 音源
                const url = 'https://www.gequhai.com' + href
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

        const coverReg = /mp3_cover\s*=\s*['"]([^'"]+)['"]/
        const cover = rawHtml.match(coverReg)
        if (cover) {
          musicItem.artwork = cover[1];
        }

        const playIdReg = /play_id\s*=\s*['"]([^'"]+)['"]/

        const match = rawHtml.match(playIdReg);
        if (!match) {
            throw new Error("无法找到播放ID");
        } else {
            console.log("play_id:", match[1]);
        }

        let data = `id=${querystring.escape(match[1])}`

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.gequhai.com/api/music',
            headers: {
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'zh-CN,zh;q=0.9,ko;q=0.8',
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'origin': 'https://www.gequhai.com',
                'pragma': 'no-cache',
                'priority': 'u=1, i',
                'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'x-custom-header': 'SecretKey',
                'x-requested-with': 'XMLHttpRequest'
            },
            data : data
        }

        const resp = await axios.request(config)
        return {
            url: resp.data.data.url,
            quality: "standard",
        };
    },
};
