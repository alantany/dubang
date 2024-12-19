Component({
  properties: {
    currentImage: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    }
  },

  data: {
    showDescription: false
  },

  methods: {
    handleImageLoad() {
      console.log('图片加载成功')
      this.setData({
        showDescription: true
      })
    },

    handleImageError(e) {
      console.error('图片加载失败', e)
      wx.showToast({
        title: '图片加载失败',
        icon: 'error'
      })
    }
  }
}) 