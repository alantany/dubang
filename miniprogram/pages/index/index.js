// index.js
const plugin = requirePlugin("WechatSI")

Page({
  data: {
    buttonText: '',
    inputText: '',
    currentVideo: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/blood_pressure.mp4',
    description: '欢迎使用都邦健康\n\n我们现在提供\n\n护理、血压仪、椅子、茶道、旅游\n\n等方面服务\n\n比如,您可以说:介绍一些旅游方面的服务',
    serviceConfig: {
      '椅子': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/chair.mp4',
        description: '人体工学椅采用科学设计，能有效缓解老年人久坐腰酸背痛，预防脊椎问题。特殊的靠背支撑，让您在看电视、阅读时保持正确坐姿，提升生活品质。'
      },
      '血压': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/blood_pressure.mp4',
        description: '智能血压计配备大屏显示，操作简单。支持数据记录和分析，帮助老年人随时掌握血压状况，预防心脑血管疾病。内置预警提醒守护您的健康。'
      },
      '旅游': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/travel.mp4',
        description: '精心定制的老年旅游套餐，配备专业医护人员陪同。行程节奏轻松，住宿舒适，让您在游览美景的同时，放松身心，增进健康，结交新朋友。'
      },
      '茶': {
        video: 'cloud://dubang-care-9gjaqmi865fbdafa.6475-dubang-care-9gjaqmi865fbdafa-1333640242/video/green_tea.mp4',
        description: '精选优质茶叶，富含多种有益成分。适合老年人饮用，可以提神醒脑，帮助消化，改善睡眠。配合养生茶具套装，让品茶成为健康享受。'
      }
    },
    conversation_id: '123123',
    hasRecordAuth: false,
    isRecording: false
  },

  onLoad() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    console.log('当前页面路径:', currentPage.route)
    console.log('当前视频:', this.data.currentVideo)
    
    // 检查录音授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.record']) {
          this.setData({ hasRecordAuth: true })
          this.initRecorder()
        } else {
          // 主���请求授权
          this.requestRecordAuth()
        }
      }
    })
  },

  // 请求录音授权
  requestRecordAuth() {
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        console.log('录音授权成功')
        this.setData({ hasRecordAuth: true })
        this.initRecorder()
      },
      fail: () => {
        console.log('录音授权失败')
        wx.showModal({
          title: '需要录音权限',
          content: '请允许使用麦克风，以便使用语音功能',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.record']) {
                    this.setData({ hasRecordAuth: true })
                    this.initRecorder()
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  loadVideo(video) {
    console.log('加载视频:', video)
    // 添加时间戳避免缓存
    const timestamp = new Date().getTime()
    const videoUrl = `${video}?t=${timestamp}`
    
    // 先设置视频路径
    this.setData({
      currentVideo: videoUrl
    })

    // 获取视频上下文并播放
    const videoContext = wx.createVideoContext('myVideo', this)
    videoContext.play()
  },

  handleVideoError(e) {
    console.error('视频播放错误:', e.detail)
    wx.showToast({
      title: '视频加载失败',
      icon: 'error'
    })
  },

  initRecorder() {
    if (!this.data.hasRecordAuth) {
      this.requestRecordAuth()
      return
    }

    // 使用同声传译插件的语音识别管理器
    this.recorderManager = plugin.getRecordRecognitionManager()

    // 监听识别结果
    this.recorderManager.onRecognize = (res) => {
      console.log("当前识别结果:", res.result)
      if (res.result) {
        this.setData({
          description: `正在识别: ${res.result}`
        })
      }
    }

    // 监听录音开始事件
    this.recorderManager.onStart = (res) => {
      console.log('录音开始', res)
      this.setData({
        description: '正在录音，请说话...',
        isRecording: true
      })
    }

    // 监听录音结束事件
    this.recorderManager.onStop = (res) => {
      console.log('录音结束', res)
      this.setData({
        isRecording: false
      })

      if (!res.result) {
        this.setData({
          description: '未能识别，请重试'
        })
        return
      }

      this.setData({
        description: '录音完成，正在处理...'
      })

      this.handleQuery(res.result)
    }

    // 监听录音错误事件
    this.recorderManager.onError = (res) => {
      console.error('录音错误:', res)
      this.setData({
        isRecording: false
      })

      let errorMsg = '录音出错'
      if (res.retcode === -30004) {
        errorMsg = '未能识别语音，请重试'
      } else if (res.retcode === -30003) {
        errorMsg = '录音时间太短'
      } else if (res.retcode === -30002) {
        errorMsg = '录音失败，请重试'
      }
      
      this.setData({
        description: errorMsg
      })
      this.handleError(errorMsg)
    }
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
              console.log('找到服务配置:', service)
              // 先设置视频路径
              this.loadVideo(service.video)
              // 然后更新描述文本
              setTimeout(() => {
                this.setData({
                  description: service.description,
                  inputText: '',
                  conversation_id: res.data.conversation_id
                })
              }, 100)
            } else {
              console.log('未找到服务配置，关键词:', keyword)
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
    if (!this.data.hasRecordAuth) {
      this.requestRecordAuth()
      return
    }

    if (!this.recorderManager) {
      this.initRecorder()
      return
    }

    if (this.data.isRecording) {
      return
    }

    this.setData({
      buttonText: '松开结束',
      description: '准备录音...'
    })

    // 开始录音识别
    this.recorderManager.start({
      duration: 30000,
      lang: "zh_CN",
      minVolume: 0.1
    })
  },

  handleTouchEnd() {
    if (this.recorderManager && this.data.isRecording) {
      this.setData({
        buttonText: '',
        description: '正在处理...'
      })
      wx.hideToast()
      this.recorderManager.stop()
    }
  },

  handleError(message) {
    wx.showToast({
      title: message,
      icon: 'error'
    })
  }
})