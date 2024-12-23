// index.js
Page({
  data: {
    buttonText: '',
    inputText: '',
    currentVideo: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/blood_pressure.mp4',
    description: '欢迎使用都邦健康，请输入或按住按钮说话',
    serviceConfig: {
      '椅子': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/chair.mp4',
        description: '人体工学椅采用科学设计，能有效缓解老年人久坐腰酸背痛，预防脊椎问题。特殊的靠背支撑，让您在看电视、阅读时保持正确坐姿，提升生活品质。'
      },
      '血压': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/blood_pressure.mp4',
        description: '智能血压计配备大屏显示，操作简单。支持数据记录和分析，帮助老年人随时掌握血压状况，预防心脑血管疾病。内置预警提醒，守护您的健康。'
      },
      '旅游': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/travel.mp4',
        description: '精心定制的老年旅游套餐，配备专业医护人员陪同。行程节奏轻松，住宿舒适，让您在游览美景的同时，放松身心，增进健康，结交新朋友。'
      },
      '茶': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/tea.mp4',
        description: '精选优质茶叶，富含多种有益成分。适合老年人饮用，可以提神醒脑，帮助消化，改善睡眠。配合养生茶具套装，让品茶成为健康享受。'
      }
    },
    conversation_id: '123123'
  },

  onLoad() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    console.log('当前页面路径:', currentPage.route)
    console.log('当前视频:', this.data.currentVideo)
    
    this.initRecorder()
  },

  loadVideo(video) {
    console.log('加载视频:', video)
    this.setData({
      currentVideo: video
    })
  },

  handleVideoError(e) {
    console.error('视频播放错误:', e.detail)
    wx.showToast({
      title: '视频加载失败',
      icon: 'error'
    })
  },

  initRecorder() {
    // 创建录音管理器
    this.recorderManager = wx.createRecorderManager()

    // 监听录音开始事件
    this.recorderManager.onStart(() => {
      console.log('录音开始')
      this.setData({
        description: '正在录音...'
      })
    })

    // 监听录音结束事件
    this.recorderManager.onStop((res) => {
      console.log('录音结束', res)
      const { tempFilePath } = res
      
      this.setData({
        description: '录音完成，正在识别...'
      })

      // 使用微信同声传译插件
      const plugin = requirePlugin("WechatSI")
      plugin.recognize({
        audioFile: tempFilePath,
        success: (res) => {
          console.log('语音识别结果:', res.result)
          this.handleQuery(res.result)
        },
        fail: (err) => {
          console.error('语音识别失败:', err)
          this.handleError('语音识别失败')
        }
      })
    })

    // 监听录音错误事件
    this.recorderManager.onError((res) => {
      console.error('录音错误:', res)
      this.handleError('录音出错')
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
            const keyword = answer.content.trim()
            console.log('识别到的关键词:', keyword)

            const service = this.data.serviceConfig[keyword]
            if (service) {
              this.loadVideo(service.video)
              this.setData({
                description: service.description,
                inputText: '',
                conversation_id: res.data.conversation_id
              })
            } else {
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
    this.recorderManager.stop()
  },

  handleError(message) {
    wx.showToast({
      title: message,
      icon: 'error'
    })
  }
})