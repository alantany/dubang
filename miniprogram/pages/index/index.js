// index.js
Page({
  data: {
    buttonText: '',
    inputText: '',
    currentVideo: '../../videos/tea.mp4',
    description: '欢迎使用都邦健康，请输入或按住按钮说话',
    serviceConfig: {
      '椅子': {
        video: '../../videos/chair.mp4',
        description: '人体工学椅，让您的腰部更舒适'
      },
      '血压': {
        video: '../../videos/blood_pressure.mp4',
        description: '智能血压计，随时监测您的健康'
      },
      '旅游': {
        video: '../../videos/travel.mp4',
        description: '特惠旅游套餐，放松身心'
      },
      '茶': {
        video: '../../videos/tea.mp4',
        description: '养生茶饮，调理身体'
      }
    },
    conversation_id: '123123'
  },

  onLoad() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'prod-0g7qz7v26d12f2b1',
      traceUser: true
    })
    
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
        description: '录音完成，正在识别...'
      })

      // 播放录音
      this.innerAudioContext.src = tempFilePath
      this.innerAudioContext.play()

      // 这里可以添加语音转文字的功能
      // 目前先使用默认文本进行测试
      const testQuery = "我想了解一下血压计"
      this.handleQuery(testQuery)
    })

    this.recorderManager.onError((res) => {
      console.error('录音错误:', res)
      this.handleError('录音出错')
    })

    this.innerAudioContext.onEnded(() => {
      this.setData({
        description: '正在分析您的需求...'
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

  handleQuery(query) {
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
        query: `请分析这句话的意图，只返回一个关键词（椅子/血压/旅游/茶）："${query}"`,
        stream: false
      },
      success: (res) => {
        console.log('API响应:', res.data)
        if (res.data && res.data.code === 0 && res.data.messages) {
          const answer = res.data.messages.find(msg => msg.type === 'answer')
          if (answer) {
            // 从回答中提取关键词
            const keyword = answer.content.trim()
            console.log('识别到的关键词:', keyword)

            // 查找对应的服务配置
            const service = this.data.serviceConfig[keyword]
            if (service) {
              this.setData({
                currentVideo: service.video,
                description: service.description,
                inputText: '',
                conversation_id: res.data.conversation_id
              })
            } else {
              // 如果没有找到对应的服务，保持默认显示
              this.setData({
                description: '抱歉，我没有找到相关的服务信息',
                inputText: '',
                conversation_id: res.data.conversation_id
              })
            }
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

  handleSend() {
    if (!this.data.inputText.trim()) {
      this.handleError('请输入内容')
      return
    }

    this.handleQuery(this.data.inputText)
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