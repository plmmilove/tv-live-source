const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
  platform: '无忧',
  version: '1.0.0',
  cacheControl: 'no-cache',
  cache: new Map(),
  async search(query, page, type) {
    if (type === 'music') {
      query = encodeURIComponent(query)

      const searchResults = await this.getMusicList(
        `https://www.qeecc.com/so/${query}/${page}.html`)
      return {
        isEnd: false,
        data: searchResults,
      }
    }
  },

  async getMusicInfo(musicBase) {
    const rawHtml = (
      await axios.get(`https://www.qeecc.com/song/${musicBase.id}.html`)
    ).data

    const $ = cheerio.load(rawHtml)
    const cover = $('#mcover').attr('src')

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
      quality: 'standard',
    }
  },

  async getLyric(musicItem) {
    const pd = await this.getPostData(musicItem.id)
    const cid = pd.lkid
    if (!cid) {
      return null
    }

    const resp = await fetch(`https://js.eev3.com/lrc.php?cid=${cid}`, {
      'headers': {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'zh-CN,zh;q=0.9,ko;q=0.8',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
      },
      'body': null,
      'method': 'GET',
      'mode': 'cors',
      'credentials': 'omit',
    })

    let data = await resp.text()
    data = JSON.parse(data)

    return {
      rawLrc: data.lrc,
    }
  },

  async getTopLists() {
    return [
      {data: [{id: 'djwuqu'}], title: 'DJ舞曲大全'},
      {data: [{id: 'share'}], title: '音乐热评榜'},
      {data: [{id: 'ndtop'}], title: '音乐先锋榜'},
      {data: [{id: 'hktop'}], title: '爱听电音榜'},
      {data: [{id: 'cztop'}], title: '车载歌曲榜'},
      {data: [{id: 'ygtop'}], title: '英国排行榜'},
      {data: [{id: 'krtop'}], title: '韩国排行榜'},
      {data: [{id: 'jptop'}], title: '日本排行榜'},
      {data: [{id: 'kuaishou'}], title: '快手热歌榜'},
      {data: [{id: 'douyin'}], title: '抖音热歌榜'},
      {data: [{id: 'kwyc'}], title: '酷我原创榜'},
      {data: [{id: 'newacg'}], title: 'ACG新歌榜'},
      {data: [{id: 'kuwo'}], title: '酷我飙升榜'},
      {data: [{id: 'dytop'}], title: '电音热歌榜'},
      {data: [{id: 'newzy'}], title: '综艺新歌榜'},
      {data: [{id: 'sctop'}], title: '说唱先锋榜'},
      {data: [{id: 'ystop'}], title: '影视金曲榜'},
      {data: [{id: 'yytop'}], title: '粤语金曲榜'},
      {data: [{id: 'ustop'}], title: '欧美金曲榜'},
      {data: [{id: 'blhot'}], title: '80后热歌榜'},
      {data: [{id: 'wlhot'}], title: '网红新歌榜'},
      {data: [{id: 'gfhot'}], title: '古风音乐榜'},
      {data: [{id: 'xrtop'}], title: '夏日畅爽榜'},
      {data: [{id: 'vip'}], title: '会员喜爱榜'},
      {data: [{id: 'jstop'}], title: '跑步健身榜'},
      {data: [{id: 'bbtop'}], title: '宝宝哄睡榜'},
      {data: [{id: 'sqtop'}], title: '睡前放松榜'},
      {data: [{id: 'aytop'}], title: '熬夜修仙榜'},
      {data: [{id: 'vlogtop'}], title: 'Vlog必备榜'},
      {data: [{id: 'ktvtop'}], title: 'KTV点唱榜'},
      {data: [{id: 'tqltop'}], title: '通勤路上榜'},
      {data: [{id: 'hot'}], title: '网络红歌榜'},
      {data: [{id: 'new'}], title: '网络最新榜'}
    ]
  },

  async getTopListDetail(topListItem, page) {
    let url = `https://www.qeecc.com/${topListItem.id}/${page}.html`
    const results = await this.getMusicList(url)
    return {
      isEnd: false,
      musicList: results,
    }
  },

  async getRecommendSheetTags() {
    const rawHtml = (
      await axios.get(`https://www.qeecc.com/playtype/index.html`)
    ).data

    const $ = cheerio.load(rawHtml)
    const data = []
    const rootElements = $('div.ilingku_fl')
    rootElements.each((index, element) => {
      const title = $(element).find('li:eq(0)').text().trim().slice(0,
        -1).trim()
      const resultElements = $(element).find('li > a')

      const subData = []
      resultElements.each((siindex, se) => {
        const e = $(se)

        const href = e.attr('href')
        const subTitle = e.text()
        const id = href.slice(10, -5)

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
    let url = `https://www.qeecc.com/playtype/${tag.id}/${page}.html`

    const rawHtml = (
      await axios.get(url)
    ).data

    const $ = cheerio.load(rawHtml)

    const list = []
    const resultElements = $('div.video_list > ul.play > li')

    for (let i = 0; i < resultElements.length; i++) {
      const e = $(resultElements[i])

      const href = e.find('div.pic > a').attr('href')
      const id = href.slice(10, -5)

      const title = e.find('div.name > a').attr('title')
      const coverImg = e.find('div.pic > a > img').attr('src')

      list.push({
        id,
        title,
        coverImg,
        artwork: coverImg,
      })
    }

    return {
      isEnd: false,
      data: list,
    }
  },

  async getMusicSheetInfo(sheetBase) {
    return await this.getMusicList(
      `https://www.qeecc.com/song/${sheetBase.id}.html`)
  },

  async getMusicList(url) {
    const rawHtml = (
      await axios.get(url)
    ).data

    const $ = cheerio.load(rawHtml)
    const list = []
    const resultElements = $('.play_list > ul > li > div.name')
    resultElements.each((index, element) => {
      const e = $(element).find('a')

      const href = e.attr('href')
      const txt = e.text()

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
    })

    return list
  },

  async getPostData(id) {
    let data = this.cache.get(id)
    if (!data) {
      const resp = await fetch('https://www.qeecc.com/js/play.php', {
        'headers': {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': `https://www.qeecc.com/song/${id}.html`,
        },
        'body': 'id=' + id + '&type=music',
        'method': 'POST',
      })

      data = await resp.text()
      data = JSON.parse(data)

      if (this.cache.size === 100) {
        this.cache.delete(this.cache.keys().next().value)
      }
      this.cache.set(id, data)
    }
    return data
  },
}
