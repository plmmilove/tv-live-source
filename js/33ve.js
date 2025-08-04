const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
  platform: '闪闪',
  version: '1.0.0',
  cacheControl: 'no-cache',
  cache: new Map(),
  async search(query, page, type) {
    if (type === 'music') {
      query = encodeURIComponent(query)

      const { isEnd, musicList } = await this.getMusicList(
        `https://www.33ve.com/so.php?wd=${query}&page=${page}`)
      return {
        isEnd: isEnd,
        data: musicList,
      }
    }
  },

  async getMusicInfo(musicBase) {
    const data = await this.getPostData(musicBase.id)

    return {
      artist: data.singer,
      /** 专辑封面图 */
      artwork: data.pic,
      rawLrc: data.lrc,
      url: data.url,
      duration: 300,
    }
  },

  async getMusicList(url) {
    const rawHtml = (
      await axios.get(url)
    ).data

    const $ = cheerio.load(rawHtml)
    const list = []
    const resultElements = $('.play_list > ul > li')
    resultElements.each((index, element) => {
      const e = $(element).find('div.pic > a')
      const href = e.attr('href')

      const id = href.slice(5, -5)
      const title = $(e).find('img').attr('alt')

      list.push({
        id,
        title,
        duration: 300,
        platform: this.platform,
      })
    })

    return {
      isEnd: $('div.page > a:contains("下一页")').length === 0,
      musicList: list,
    }
  },

  async getPostData(id) {
    let data = this.cache.get(id)
    if (!data) {
      const resp = await fetch("https://www.33ve.com/style/js/play.php", {
        "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "zh-CN,zh;q=0.9,ko;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          "Referer": `https://www.33ve.com/mp3/${id}.html`
        },
        "body": `id=${id}&type=dance`,
        "method": "POST"
      })

      data = await resp.json()

      if (this.cache.size === 100) {
        this.cache.delete(this.cache.keys().next().value)
      }
      this.cache.set(id, data)
    }
    return data
  },
}
