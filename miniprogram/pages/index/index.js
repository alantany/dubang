// index.js
Page({
  data: {
    buttonText: '点击开始录音',
    currentImage: '../../images/display/compressed/tea.jpg',
    description: '欢迎使用都邦健康，请点击按钮开始语音交互',
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

  handleRecordingStateChange(e) {
    console.log('录音状态变化:', e.detail)
    const { isRecording, tempFilePath } = e.detail
    
    this.setData({
      buttonText: isRecording ? '点击结束录音' : '点击开始录音'
    })

    if (tempFilePath) {
      // 这里可以添加语音识别逻辑
      console.log('录音文件路径:', tempFilePath)
      
      // 模拟识别结果，随机选择一个服务
      const services = Object.keys(this.data.serviceConfig)
      const randomService = services[Math.floor(Math.random() * services.length)]
      const serviceInfo = this.data.serviceConfig[randomService]
      
      this.setData({
        currentImage: serviceInfo.image,
        description: serviceInfo.description
      })
    }
  },

  handleRecordingError(e) {
    console.error('录音错误:', e.detail)
    this.setData({
      buttonText: '点击开始录音'
    })
  }
})