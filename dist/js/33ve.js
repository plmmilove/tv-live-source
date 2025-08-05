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

      const {isEnd, musicList} = await this.getSearchMusicList(
        `https://www.33ve.com/so.php?wd=${query}&page=${page}`)
      return {
        isEnd: isEnd,
        data: musicList,
      }
    }
  },

  async getMediaSource(musicItem, quality) {
    const data = await this.getPostData(musicItem.id)

    return {
      url: data.url,
      quality: 'standard',
    }
  },

  async getLyric(musicItem) {
    const data = await this.getPostData(musicItem.id)

    return {
      rawLrc: data.lrc,
    }
  },

  async getTopLists() {
    return [{
      data: [
        {id: 'kugou', title: '酷狗飙升榜'},
        {id: 'top', title: 'TOP排行榜'},
        {id: 'douyin', title: '抖音热歌榜'},
        {id: 'kuaishou', title: '快手热歌榜'},
        {id: 'djtop', title: 'DJ热歌榜'},
        {id: 'share', title: '音乐分享榜'},
        {id: 'ndtop', title: '内地排行榜'},
        {id: 'hktop', title: '香港排行榜'},
        {id: 'twtop', title: '台湾排行榜'},
        {id: 'ustop', title: '欧美排行榜'},
        {id: 'krtop', title: '韩国排行榜'},
        {id: 'newacg', title: 'ACG新歌榜'},
        {id: 'dytop', title: '电音热歌榜'},
        {id: 'newzy', title: '综艺新歌榜'},
        {id: 'sctop', title: '说唱先锋榜'},
        {id: 'ystop', title: '影视金曲榜'},
        {id: 'yytop', title: '粤语金曲榜'},
        {id: 'omtop', title: '欧美金曲榜'},
        {id: 'kkyc', title: '音乐人原创榜'},
        {id: 'leida', title: '酷狗雷达榜'},
        {id: 'blhot', title: '80后热歌榜'},
        {id: 'jlhot', title: '90后热歌榜'},
        {id: 'mgtop', title: '美国单曲榜'},
        {id: 'ygtop', title: '英国单曲榜'},
        {id: 'rbtop', title: '日本歌曲榜'},
        {id: 'hgtop', title: '韩国音乐榜'},
        {id: 'joox', title: 'JOOX热歌榜'},
        {id: 'kkbox', title: 'KKBOX风云榜'},
        {id: 'space', title: 'SHOWER榜'},
        {id: 'btptop', title: '电子舞曲榜'},
        {id: 'xyztop', title: '小语种热歌'},
        {id: 'song', title: '洗脑神曲'},
        {id: 'djwuqu', title: 'DJ舞曲'},
      ],
    }]
  },

  async getTopListDetail(topListItem, page) {
    let url = `https://www.33ve.com/list/${topListItem.id}/${page}.html`
    return await this.getMusicList(url)
  },

  async getRecommendSheetTags() {
    const rawHtml = (
      await axios.get(`https://www.33ve.com/gdlist/index.html`)
    ).data

    const $ = cheerio.load(rawHtml)
    const data = []
    const rootElements = $('div.class')
    rootElements.each((index, element) => {
      const title = $(element).find('h1').text().trim()
      const resultElements = $(element).find('ul > li > a')

      const subData = []
      resultElements.each((si, se) => {
        const e = $(se)

        const href = e.attr('href')
        const subTitle = e.text()
        const id = href.slice(8, -5)

        subData.push({
          id,
          title: subTitle,
        })
      })

      data.push({
        title,
        data: subData,
      })
    })

    return {
      pinned: data.length > 0 ? data[0].data : [],
      data,
    }
  },

  async getRecommendSheetsByTag(tag, page) {
    let url = `https://www.33ve.com/gdlist/${tag.id}/${page}.html`

    const rawHtml = (
      await axios.get(url)
    ).data

    const $ = cheerio.load(rawHtml)

    const list = []
    const resultElements = $('div.lkpic_list > ul > li')

    for (let i = 0; i < resultElements.length; i++) {
      const e = $(resultElements[i])

      const href = e.find('div.pic > a').attr('href')
      const id = href.slice(10, -5)

      const title = e.find('div.name > a:eq(0)').text()
      const coverImg = e.find('div.pic > a > img').attr('src')

      list.push({
        id,
        title,
        coverImg,
        artwork: coverImg,
      })
    }

    return {
      isEnd: $('div.page > a:contains("下一页")').length === 0,
      data: list,
    }
  },

  async getMusicSheetInfo(sheetBase, page) {
    return await this.getMusicSheetMusicList(
      `https://www.33ve.com/playlist/${sheetBase.id}/${page}.html`)
  },

  async getSearchMusicList(url) {
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
      const name = $(element).find('div.name > a:eq(0)').text()

      const artist = name.substring(0, name.indexOf('-')).trim()
      const artwork = $(e).find('img').attr('src')

      list.push({
        id,
        title,
        artist,
        artwork,
        duration: 300,
        platform: this.platform,
      })
    })

    return {
      isEnd: $('div.page > a:contains("下一页")').length === 0,
      musicList: list,
    }
  },

  async getMusicSheetMusicList(url) {
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
      const artwork = $(e).find('img').attr('src')

      const name = $(element).find('div.name > a').text()
      const artist = name.substring(0, name.indexOf('-')).trim()

      list.push({
        id,
        title,
        artist,
        artwork,
        duration: 300,
        platform: this.platform,
      })
    })

    return {
      isEnd: $('div.page > a:contains("下一页")').length === 0,
      musicList: list,
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
      const artwork = $(e).find('img').attr('src')

      const artist = $(element).find('div.list_r > p > a:eq(0)').text()

      list.push({
        id,
        title,
        artist,
        artwork,
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
      const resp = await fetch('https://www.33ve.com/style/js/play.php', {
        'headers': {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9,ko;q=0.8',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': `https://www.33ve.com/mp3/${id}.html`,
        },
        'body': `id=${id}&type=dance`,
        'method': 'POST',
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
