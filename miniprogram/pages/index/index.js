// index.js
Page({
  data: {
    buttonText: '',
    currentImage: '../../images/display/compressed/tea.jpg',
    description: '欢迎使用都邦健康，请按住按钮开始说话',
    serviceConfig: {
      '椅子': {
        image: '../../images/display/compressed/chair.jpg',
        description: '人体工学椅，让您的腰部更舒适'
      },
      '血压': {
        image: '../../images/display/compressed/blood_pressure.jpg',
        description: '智能血压计，随时监测您的健康'
      },
      '旅游': {
        image: '../../images/display/compressed/travel.jpg',
        description: '特惠旅游套餐，放松身心'
      },
      '茶': {
        image: '../../images/display/compressed/tea.jpg',
        description: '养生茶饮，调理身体'
      }
    }
  },

  onLoad() {
    // 初始化录音管理器
    this.recorderManager = wx.getRecorderManager()
    
    // 监听录音结束事件
    this.recorderManager.onStop((res) => {
      console.log('录音结束', res)
      // 开始识别语音
      this.recognizeSpeech(res.tempFilePath)
    })
  },

  handleTouchStart() {
    this.setData({
      buttonText: '请说话...'
    })
    wx.showToast({
      title: '请说话...',
      icon: 'none',
      duration: 60000
    })

    // 开始录音
    this.recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    })
  },

  handleTouchEnd() {
    this.setData({
      buttonText: ''
    })
    wx.hideToast()
    // 停止录音
    this.recorderManager.stop()
  },

  recognizeSpeech(tempFilePath) {
    // 显示加载提示
    wx.showLoading({
      title: '正在识别...',
    })

    // 调用微信语音识别接口
    wx.uploadFile({
      url: 'https://YOUR_SERVER_URL/speech-to-text', // 这里需要替换为实际的服务器地址
      filePath: tempFilePath,
      name: 'audio',
      success: (res) => {
        wx.hideLoading()
        try {
          const result = JSON.parse(res.data)
          if (result.text) {
            console.log('识别结果:', result.text)
            this.setData({
              description: `识别结果: ${result.text}`
            })
            // TODO: 这里可以添加发送给大模型的逻辑
          } else {
            this.handleRecognitionError('识别结果为空')
          }
        } catch (e) {
          this.handleRecognitionError('解析识别结果失败')
        }
      },
      fail: (err) => {
        console.error('语音识别失败:', err)
        this.handleRecognitionError('语音识别失败')
      }
    })
  },

  handleRecognitionError(message) {
    wx.hideLoading()
    wx.showToast({
      title: message,
      icon: 'error'
    })
  }
})