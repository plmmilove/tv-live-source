module.exports = {
  platform: '米兔',
  version: '1.0.0',
  cacheControl: 'no-cache',
  cache: new Map(),
  async search(query, page, type) {
    if (type === 'music') {
      query = encodeURIComponent(query)
      const resp = await fetch(
        `https://www.qqmp3.vip/api/songs.php?type=search&keyword=${query}`, {
          'credentials': 'include',
          'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Priority': 'u=0',
          },
          'referrer': 'https://www.qqmp3.vip/',
          'method': 'GET',
          'mode': 'cors',
        })

      let data = await resp.json()

      const searchResults = []
      data.data.forEach((e) => {
        const id = e.rid
        const title = e.name
        const artist = e.artist
        const artwork = e.pic

        searchResults.push({
          id,
          title,
          artist,
          artwork,
          duration: 300,
        })
      })
      return {
        isEnd: false,
        data: searchResults,
      }
    }
  },

  async getMediaSource(musicItem, quality) {
    const pd = await this.getPostData(musicItem.id)

    return {
      url: pd.data.url,
      quality: 'standard',
    }
  },

  async getLyric(musicItem) {
    const pd = await this.getPostData(musicItem.id)

    return {
      rawLrc: pd.data.lrc,
    }
  },

  async getRecommendSheetTags() {
    return {
      pinned: [
        {
          id: 'hot',
          title: '热门',

          // find bug
          coverImg: '',
          artwork: '',
          artist: '',
          description: '',
          worksNum: 20,
          platform: this.platform,
        },
        {
          id: 'random',
          title: '随机',

          // find bug
          coverImg: '',
          artwork: '',
          artist: '',
          description: '',
          worksNum: 20,
          platform: this.platform,
        },
      ],
    }
  },

  async getRecommendSheetsByTag(tag, page) {
    let url
    if (tag.id === 'random') {
      url = 'https://www.qqmp3.vip/api/songs.php?type=rand'
    } else {
      url = 'https://www.qqmp3.vip/api/songs.php'
    }

    const resp = await fetch(url, {
      'credentials': 'include',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Priority': 'u=0',
      },
      'referrer': 'https://www.qqmp3.vip/',
      'method': 'GET',
      'mode': 'cors',
    })

    let data = await resp.json()

    const musicList = []
    data.data.forEach((e) => {
      const id = e.rid
      const title = e.name
      const artist = e.artist
      const artwork = e.pic

      musicList.push({
        id,
        title,
        artist,
        artwork,
        duration: 300,

        // find bug
        platform: this.platform,
        album: '',
      })
    })

    return {
      isEnd: true,
      data: [
        {
          id: tag.id,
          title: tag.id === 'random' ? '随机推荐' : tag.id === 'hot' ? '热门推荐' : tag.id,
          coverImg: musicList.length > 0 ? musicList[0].artwork : null,
          artwork: musicList.length > 0 ? musicList[0].artwork : null,
          worksNum: musicList.length,
          musicList,
          
          //find bug
          artist: '',
          description: '',
          platform: this.platform,
        },
      ],
    }
  },

  async getPostData(id) {
    let data = this.cache.get(id)
    if (!data) {
      const resp = await fetch(
        `https://www.qqmp3.vip/api/kw.php?rid=${id}&type=json&level=exhigh&lrc=true`,
        {
          'credentials': 'include',
          'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Priority': 'u=0',
          },
          'referrer': 'https://www.qqmp3.vip/',
          'method': 'GET',
          'mode': 'cors',
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
