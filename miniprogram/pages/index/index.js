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
    // 初始化语音识别管理器
    this.initVoiceRecognition()
  },

  initVoiceRecognition() {
    // 获取全局唯一的录音管理器
    this.manager = wx.getRecorderManager()

    // 监听录音开始事件
    this.manager.onStart(() => {
      console.log('录音开始')
    })

    // 监听录音结束事件
    this.manager.onStop((res) => {
      console.log('录音结束', res)
      const { tempFilePath } = res
      
      // 显示加载提示
      wx.showLoading({
        title: '正在识别...'
      })

      // 调用微信语音识别接口
      wx.getFileSystemManager().readFile({
        filePath: tempFilePath,
        success: (res) => {
          const buffer = res.data
          wx.cloud.callFunction({
            name: 'speechToText',
            data: {
              audioData: buffer
            },
            success: (res) => {
              wx.hideLoading()
              if (res.result && res.result.text) {
                console.log('识别结果:', res.result.text)
                this.setData({
                  description: `识别结果: ${res.result.text}`
                })
                // TODO: 这里可以添加发送给大模型的逻辑
              } else {
                this.handleRecognitionError('识别结果为空')
              }
            },
            fail: (err) => {
              console.error('语音识别失败:', err)
              this.handleRecognitionError('语音识别失败')
            }
          })
        },
        fail: (err) => {
          console.error('读取录音文件失败:', err)
          this.handleRecognitionError('读取录音失败')
        }
      })
    })

    // 监听录音错误事件
    this.manager.onError((res) => {
      console.error('录音错误:', res)
      this.handleRecognitionError('录音出错')
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
    this.manager.start({
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
    this.manager.stop()
  },

  handleRecognitionError(message) {
    wx.hideLoading()
    wx.showToast({
      title: message,
      icon: 'error'
    })
  }
})