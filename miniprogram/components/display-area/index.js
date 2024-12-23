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
  },

  lifetimes: {
    attached() {
      // 组件创建时的初始化逻辑
      console.log('视频组件已创建，路径:', this.properties.videoPath)
    },

    detached() {
      // 组件销毁时的清理逻辑
    }
  },

  pageLifetimes: {
    show() {
      // 页面显示时的逻辑
    },
    hide() {
      // 页面隐藏时的逻辑
    }
  },

  observers: {
    'description': function(description) {
      // 检查是否是欢迎文案
      this.setData({
        isWelcomeText: description.startsWith('欢迎使用都邦健康')
      });
    }
  }
}) 