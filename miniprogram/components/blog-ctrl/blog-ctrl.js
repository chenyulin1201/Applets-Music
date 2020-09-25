// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    content: '',
    modalShow: false,
    loginShow: false
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success:(res) => {
                userInfo = res.userInfo
                // 显示评论的弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          } else{
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    onLoginSuccess(event) {
      userInfo = event.detail
      this.setData({
        loginShow: false
      },() => {
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginFail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: ''
      })
    },
    onSend() {
      // 把评论信息插入数据库
      let content = this.data.content
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: ''
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true,
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          content: ''
        })
      })

      // 插入后推送模板消息
    },
    onInput(event){
      this.setData({
        content: event.detail.value
      })
    }
  }
})
