// pages/player/player.js
let musiclist = []
// 正在播放歌曲的index
let nowPlaylistIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, // false表示不播放 true表示播放
    isLyricShow: false, // 表示当前歌词是否显示
    lyric: '', // 歌词信息
    isSame: false //表示是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlaylistIndex = parseInt(options.index)
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicid)
  },

  _loadMusicDetail(musicId) {
    if (musicId === app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }
    let music = musiclist[nowPlaylistIndex]
    console.log(music, 'music')
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    app.setPlayMusicId(musicId)
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId: musicId,
        $url: 'musicUrl'
      }
    }).then((res) => {
      let result = res.result
      console.log(res, 'res')
      if (result.data[0].url === null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
      }
      this.setData({
        isPlaying: true
      })
      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) => {
        let lyric = '暂无歌词'
        if (res.result.lrc.lyric) {
          lyric = res.result.lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },

  togglePlaying() {
    if (this.data.isPlaying) {
      // 正在播放
      backgroundAudioManager.pause()
    } else {
      // 已暂停
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  
  onPrev() {
    // 上一首
    nowPlaylistIndex--
    if (nowPlaylistIndex < 0) {
      nowPlaylistIndex = musiclist.length-1
    }
    this._loadMusicDetail(musiclist[nowPlaylistIndex].id)
  },

  onNext() {
    // 下一首
    nowPlaylistIndex++
    if (nowPlaylistIndex === musiclist.length) {
      nowPlaylistIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlaylistIndex].id)
  },
  onchangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onPlay() {
    this.setData({
      isPlaying: true
    })
  },

  onPause() {
    this.setData({
      isPlaying: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})