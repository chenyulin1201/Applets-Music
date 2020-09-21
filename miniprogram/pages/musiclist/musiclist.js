// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],
    listInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'musiclist',
        playlistId: options.playlistId
      }
    }).then((res) => {
      const pl = res.result
      this.setData({
        musiclist: pl.playlist.tracks,
        listInfo: {
          coverImgUrl: pl.playlist.coverImgUrl,
          name: pl.playlist.name
        }
      })
      this._setMusiclist()
      wx.hideLoading()
      console.log(res)
    })
  },

  _setMusiclist(){
    wx.setStorage({
      data: this.data.musiclist,
      key: 'musiclist',
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