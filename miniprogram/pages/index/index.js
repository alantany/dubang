// index.js
Page({
  data: {
    buttonText: '',
    inputText: '',
    currentImage: '../../images/display/compressed/tea.jpg',
    description: '欢迎使用都邦健康，请输入或按住按钮说话',
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
    this.initRecorder()
  },

  initRecorder() {
    // 获取全局唯一的录音管理器
    this.recorderManager = wx.getRecorderManager()
    // 创建内部 audio 上下文
    this.innerAudioContext = wx.createInnerAudioContext()

    // 监听录音开始事件
    this.recorderManager.onStart(() => {
      console.log('录音开始')
    })

    // 监听录音结束事件
    this.recorderManager.onStop((res) => {
      console.log('录音结束', res)
      const { tempFilePath } = res
      
      this.setData({
        description: '录音完成，正在播放...'
      })

      // 播放录音
      this.innerAudioContext.src = tempFilePath
      this.innerAudioContext.play()
    })

    // 监听录音错误事件
    this.recorderManager.onError((res) => {
      console.error('录音错误:', res)
      this.handleError('录音出错')
    })

    // 监听播放结束
    this.innerAudioContext.onEnded(() => {
      this.setData({
        description: '录音播放完成'
      })
    })

    // 监听播放错误
    this.innerAudioContext.onError((res) => {
      console.error('播放错误:', res)
      this.handleError('播放失败')
    })
  },

  handleInput(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  handleSend() {
    if (!this.data.inputText.trim()) {
      this.handleError('请输入内容')
      return
    }

    this.setData({
      description: '正在思考中...'
    })

    wx.request({
      url: 'https://api.coze.cn/v3/chat',
      method: 'POST',
      header: {
        'Authorization': 'Bearer pat_150CPnGfyraFtlFJ76XbzILiLGzoLfxVqPCDg0yGvYvP185B9A3nUjR4dRMuI7CG',
        'Content-Type': 'application/json'
      },
      data: {
        bot_id: '7450286572244762675',
        user_id: '123123',
        stream: false,
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: this.data.inputText,
            content_type: 'text'
          }
        ]
      },
      success: (res) => {
        console.log('大模型响应:', res.data)
        if (res.data && res.data.reply) {
          this.setData({
            description: res.data.reply,
            inputText: ''
          })
        } else {
          this.handleError('响应格式错误')
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        this.handleError('网络请求失败')
      }
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

  handleError(message) {
    wx.showToast({
      title: message,
      icon: 'error'
    })
  }
})