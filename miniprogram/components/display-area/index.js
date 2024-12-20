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
    error: false
  },

  methods: {
    handleVideoError(e) {
      console.error('视频加载错误:', e)
      this.setData({
        error: true
      })
      this.triggerEvent('error', e.detail)
    }
  }
}) 