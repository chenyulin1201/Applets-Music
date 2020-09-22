// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前的描述
let isMoving = false //表示当前进度条是否在拖拽 解决：当进度条拖动时和updatetime事件有冲突问题

let duration = 0 //当前歌曲的总时长 以秒为单位
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    movableDis: 0,
    progress: 0,
    showTime: {
      currentTime: "00:00",
      totalTime: "00:00"
    }
  },

  lifetimes: {
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      // 组件在页面上布局完成后执行
      this._getMovableDis()
      this._bindBGEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
    _setTime() {
      // 获取到歌曲总时长，单位为秒，改duration参数在设置了backgroundAudioManager对象url参数之后变成获取到
      duration = backgroundAudioManager.duration
      console.log(duration)
      const durationFmt = this._dataFormat(duration)
      console.log(durationFmt)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dataFormat(sec){
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    },
    _bindBGEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onplay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      backgroundAudioManager.onPause(() => {
        console.log('onPause')
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        console.log(backgroundAudioManager.duration)
        console.log('onCanplay')
        // 多次测试在某些机器上发现backgroundAudioManager.duration会获取不到返回undefined 需做处理
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime 
          const duration = backgroundAudioManager.duration
          const currentTimeFmt = this._dataFormat(currentTime)
          if (currentTime.toString().split('.')[0] !== currentSec) {
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = currentTime.toString().split('.')[0]
            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
          // console.log('onTimeUpdate')
        }
      })
      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((err) => {
        console.log(err.errMsg)
        wx.showToast({
          title: '错误' + err.errCode,
        })
      })
    },
    onChange(event) {
      // console.log(event)
      // 表示当前是拖动产生的
      if (event.detail.source === 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      const currentTimeFmt = this._dataFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    }
  }
})
