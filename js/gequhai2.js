const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
  platform: '歌曲海',
  version: '1.0.0',
  cacheControl: 'no-store',
  async search(query, page, type) {
    if (type === 'music') {
      query = encodeURIComponent(query)
      const rawHtml = (
        await axios.get(`https://www.gequhai.com/s/${query}`)
      ).data

      const $ = cheerio.load(rawHtml)
      const searchResults = []
      const resultElements = $('#myTables').find('tbody > tr')
      resultElements.each((index, element) => {
        const tr1 = $(element).find('td:eq(1) > a')
        const tr2 = $(element).find('td:eq(2)')

        const href = tr1.attr('href')

        const id = href.slice(6)
        const title = tr1.text().trim()
        const artist = tr2.text().trim()

        searchResults.push({
          id,
          title,
          artist,
        })
      })
      return {
        isEnd: true,
        data: searchResults,
      }
    }
  },

  async getMediaSource(musicItem, quality) {
    const rawHtml = (
      await axios.get(`https://www.gequhai.com/play/${musicItem.id}`)
    ).data

    const playIdReg = /play_id\s*=\s*['"]([^'"]+)['"]/
    const coverReg = /mp3_cover\s*=\s*['"]([^'"]+)['"]/
    const titleReg = /mp3_title\s*=\s*['"]([^'"]+)['"]/
    const authorReg = /mp3_author\s*=\s*['"]([^'"]+)['"]/

    const playId = rawHtml.match(playIdReg)
    const cover = rawHtml.match(coverReg)
    const title = rawHtml.match(titleReg)
    const author = rawHtml.match(authorReg)

    musicItem.artist = author[1]
    musicItem.title = title[1]
    musicItem.duration = 300
    musicItem.artwork = cover[1]

    const $ = cheerio.load(rawHtml)
    musicItem.rawLrc = $('#content-lrc2').text()

    if (!playId) {
      throw new Error('无法找到播放ID')
    }

    let data = `id=${encodeURIComponent(playId[1])}`

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
        'x-requested-with': 'XMLHttpRequest',
      },
      data: data,
    }

    const resp = await axios.request(config)

    return {
      url: resp.data.data.url,
      quality: 'standard',
    }
  },

  async getLyric(musicItem) {
    return {
      rawLrc: musicItem.rawLrc
    }
  }
}
