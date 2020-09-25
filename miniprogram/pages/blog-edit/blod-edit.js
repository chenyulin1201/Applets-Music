// pages/blog-edit/blod-edit.js
const MAX_WORDS_NUM = 140 // 输入文字的最大个数
const MAX_IMG_NUM = 9 // 最大图片上传数量

const db = wx.cloud.database()
let content = '' //输入的文字内容
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectphoto: true,
    footerBottom: 0,
    wordsNum: 0, //输入字体字数
    images: [], // 当前已选择的图片数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
    console.log(options)

  },
  onInput(event){
    console.log(event.detail.value)
    let wordsNum = event.detail.value.length
    content = event.detail.value
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
  },
  onFocus(event) {
    // 模拟器获取的键盘高度为0
    console.log(event)
    this.setData({
      footerBottom: event.detail.height
    })
  },
  onBlur(event) {
    this.setData({
      footerBottom: 0
    })
  },
  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectphoto: max <= 0 ? false : true
        })
      },
    })
  },
  onDelImage(event) {
    this.data.images.splice(event.detail.index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length == MAX_IMG_NUM - 1 ) {
      this.setData({
        selectphoto: true
      })
    }
  },
  onPreviewImage(event) {
    
    const _this = this
    wx.previewImage({
      urls: _this.data.images,
      current: event.detail.imgsrc
    })
  },
  send() {
    // 第二步 数据 -> 云数据库
    // 第三步 数据库：内容，图片fileID，openid,昵称与头像 时间
    // 第一步 图片：上传到云存储中 上传后会返回一个fileID 云文件id

    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask: true,
    })
    let promiseArr = []
    let fileIds = []
    // 图片上传功能
    for (let i = 0, len = this.data.images.length; i < len ; i ++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix, // 当前上传云端的一个路径
          filePath: item, // 临时路径指的就是选择完图片是否返回来的图片url
          success: (res) => {
            console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存入到云数据库中
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate(), // 对应取到服务端时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回blog页面，刷新blog页面列表
        wx.navigateBack()
        const pages = getCurrentPages()
        // 取到上一个页面
        const prevPage = pages[pages.length-2]
        prevPage.onPullDownRefresh()
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
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