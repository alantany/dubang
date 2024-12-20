Component({
  properties: {
    currentVideo: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    }
  },

  data: {
    error: false,
    isPlaying: false
  },

  methods: {
    handleVideoPlay() {
      console.log('视频开始播放')
      this.setData({
        isPlaying: true
      })
    },

    handleVideoPause() {
      console.log('视频暂停播放')
      this.setData({
        isPlaying: false
      })
    },

    handleVideoError(e) {
      console.error('视频加载错误:', e)
      this.setData({
        error: true
      })
      wx.showToast({
        title: '视频加载失败',
        icon: 'error'
      })
      this.triggerEvent('error', e.detail)
    }
  }
}) 