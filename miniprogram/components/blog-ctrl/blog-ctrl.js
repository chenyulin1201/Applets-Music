// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    onLoginSuccess() {
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
    }
  }
})
