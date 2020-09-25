// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loginShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event) {
      console.log(event)
      if (event.detail.userInfo) {
        // 允许授权
        this.setData({
          loginShow: false
        })
        this.triggerEvent('loginsuccess', event.detail.userInfo)
      } else {
        // 拒绝授权
        this.triggerEvent('loginfail')
      }
    }
  }
})
