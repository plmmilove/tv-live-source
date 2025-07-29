const axios = require('axios')
const cheerio = require('cheerio')

class LRUCache {
  constructor(capacity) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    let val = this.cache.get(key);

    this.cache.delete(key);
    this.cache.set(key, val);

    return val;
  }

  put(key, value) {
    this.cache.delete(key);

    if (this.cache.size === this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
      this.cache.set(key, value);
    } else {
      this.cache.set(key, value);
    }
  }

  // Implement LRU/MRU retrieval methods
  getLeastRecent() {
    return Array.from(this.cache)[0];
  }

  getMostRecent() {
    return Array.from(this.cache)[this.cache.size - 1];
  }
}

module.exports = {
  platform: '歌曲海',
  version: '1.0.0',
  cacheControl: 'no-store',
  cache: new LRUCache(100),
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

  async getMusicInfo(musicBase) {
    const rawHtml = await this.getDetailHtml(musicBase.id)

    const coverReg = /mp3_cover\s*=\s*['"]([^'"]+)['"]/
    const titleReg = /mp3_title\s*=\s*['"]([^'"]+)['"]/
    const authorReg = /mp3_author\s*=\s*['"]([^'"]+)['"]/

    const cover = rawHtml.match(coverReg)
    const title = rawHtml.match(titleReg)
    const author = rawHtml.match(authorReg)

    return {
      artist: author[1],
      title: title[1],
      duration: 300,
      /** 专辑封面图 */
      artwork: cover[1],
    }
  },

  async getMediaSource(musicItem, quality) {
    const rawHtml = await this.getDetailHtml(musicItem.id)

    const playIdReg = /play_id\s*=\s*['"]([^'"]+)['"]/
    const playId = rawHtml.match(playIdReg)

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
    const rawHtml = await this.getDetailHtml(musicItem.id)

    const $ = cheerio.load(rawHtml)
    return {
      rawLrc: $('#content-lrc2').text()
    }
  },

  async getDetailHtml(id) {
    const html = this.cache.get(id)
    if(!html) {
      const rawHtml = (
        await axios.get(`https://www.gequhai.com/play/${id}`)
      ).data
      this.cache.put(id, rawHtml)
      return rawHtml
    } else {
      return html
    }
  }
}

