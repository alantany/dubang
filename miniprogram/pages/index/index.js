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
    },
    conversation_id: '123123'
  },

  onLoad() {
    this.initRecorder()
  },

  initRecorder() {
    this.recorderManager = wx.getRecorderManager()
    this.innerAudioContext = wx.createInnerAudioContext()

    this.recorderManager.onStart(() => {
      console.log('录音开始')
    })

    this.recorderManager.onStop((res) => {
      console.log('录音结束', res)
      const { tempFilePath } = res
      
      this.setData({
        description: '录音完成，正在播放...'
      })

      this.innerAudioContext.src = tempFilePath
      this.innerAudioContext.play()
    })

    this.recorderManager.onError((res) => {
      console.error('录音错误:', res)
      this.handleError('录音出错')
    })

    this.innerAudioContext.onEnded(() => {
      this.setData({
        description: '录音播放完成'
      })
    })

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
      url: 'https://api.coze.cn/open_api/v2/chat',
      method: 'POST',
      header: {
        'Authorization': 'Bearer pat_150CPnGfyraFtlFJ76XbzILiLGzoLfxVqPCDg0yGvYvP185B9A3nUjR4dRMuI7CG',
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.cn',
        'Connection': 'keep-alive'
      },
      data: {
        conversation_id: this.data.conversation_id,
        bot_id: '7450286572244762675',
        user: 'miniprogram_user',
        query: this.data.inputText,
        stream: false
      },
      success: (res) => {
        console.log('API响应:', res.data)
        if (res.data && res.data.code === 0 && res.data.messages) {
          const answer = res.data.messages.find(msg => msg.type === 'answer')
          if (answer) {
            this.setData({
              description: answer.content,
              inputText: '',
              conversation_id: res.data.conversation_id
            })
          } else {
            this.handleError('未找到回答内容')
          }
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
    this.recorderManager.stop()
  },

  handleError(message) {
    wx.showToast({
      title: message,
      icon: 'error'
    })
  }
})