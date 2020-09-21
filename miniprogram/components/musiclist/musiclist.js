// components/musiclist/musiclist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      // console.log('被选中',event.currentTarget.dataset.musicid,event.currentTarget.dataset.index)
      const ds = event.currentTarget.dataset
      this.setData({
        playingId: ds.musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicid=${ds.musicid}&index=${ds.index}`,
      })
    }
  }
})
