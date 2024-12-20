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
    errorMsg: '',
    isPlaying: false
  },

  methods: {
    handleVideoLoaded(e) {
      console.log('视频元数据加载成功:', e)
      this.setData({
        error: false,
        errorMsg: ''
      })
    },

    handleVideoError(e) {
      console.error('视频加载错误:', e)
      const errorMsg = e.detail.errMsg || '未知错误'
      this.setData({
        error: true,
        errorMsg: errorMsg
      })
      wx.showToast({
        title: '视频加载失败',
        icon: 'error'
      })
      this.triggerEvent('error', {
        error: errorMsg,
        videoPath: this.data.currentVideo
      })
    }
  }
}) 