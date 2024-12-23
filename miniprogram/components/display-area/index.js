Component({
  properties: {
    videoPath: {
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
    isPlaying: false,
    isWelcomeText: false
  },

  observers: {
    'videoPath': function(newPath) {
      if (newPath) {
        // 当视频路径更新时，自动播放新视频
        setTimeout(() => {
          const videoContext = wx.createVideoContext('myVideo', this)
          videoContext.play()
        }, 100)
      }
    },
    'description': function(description) {
      // 检查是否是欢迎文案
      this.setData({
        isWelcomeText: description.startsWith('欢迎使用都邦健康')
      });
    }
  },

  methods: {
    handleVideoError(e) {
      console.error('视频错误:', e.detail)
      const { errMsg } = e.detail
      this.setData({
        error: true,
        errorMsg: errMsg
      })
      
      // 通知页面发生错误
      this.triggerEvent('videoError', {
        error: errMsg
      })
    },

    handleVideoPlay() {
      console.log('视频开始播放')
      this.setData({
        isPlaying: true,
        error: false,
        errorMsg: ''
      })
    },

    handleVideoPause() {
      console.log('视频暂停')
      this.setData({
        isPlaying: false
      })
    },

    handleVideoEnded() {
      console.log('视频播放结束')
      this.setData({
        isPlaying: false
      })
    }
  }
}) 