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

    // 发送消息
    this.sendMessage(this.data.inputText)
  },

  sendMessage(content) {
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
            content: content,
            content_type: 'text'
          }
        ]
      },
      success: (res) => {
        console.log('API响应:', res.data)
        if (res.data && res.data.code === 0) {
          // 获取到任务ID后，开始轮询结果
          this.pollResult(res.data.data.id)
        } else {
          this.handleError('请求失败: ' + (res.data.msg || '未知错误'))
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        this.handleError('网络请求失败')
      }
    })
  },

  pollResult(taskId) {
    // 创建轮询函数
    const checkResult = () => {
      wx.request({
        url: `https://api.coze.cn/v3/message/${taskId}`,
        method: 'GET',
        header: {
          'Authorization': 'Bearer pat_150CPnGfyraFtlFJ76XbzILiLGzoLfxVqPCDg0yGvYvP185B9A3nUjR4dRMuI7CG'
        },
        success: (res) => {
          console.log('轮询结果:', res.data)
          if (res.data && res.data.code === 0) {
            const status = res.data.data.status
            if (status === 'completed') {
              // 任务完成，显示结果
              this.setData({
                description: res.data.data.reply || '对话完成',
                inputText: ''
              })
            } else if (status === 'failed') {
              this.handleError('对话失败: ' + (res.data.data.last_error?.msg || '未知错误'))
            } else if (status === 'in_progress') {
              // 继续轮询
              setTimeout(checkResult, 1000)
            }
          } else {
            this.handleError('获取结果失败: ' + (res.data.msg || '未知错误'))
          }
        },
        fail: (err) => {
          console.error('轮询失败:', err)
          this.handleError('获取结果失败')
        }
      })
    }

    // 开始轮询
    checkResult()
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