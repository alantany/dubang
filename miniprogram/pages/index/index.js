// 服务内容配置
const serviceConfig = {
  '椅子': {
    image: 'images/display/compressed/chair.jpg',
    description: '适合老年人的椅子不仅能提供舒适的坐姿，还能帮助保持良好的脊椎健康。建议选择带扶手、靠背适中、坐垫柔软的椅子，这样可以减轻腰部压力，方便起身，让您在休息时更加舒适。'
  },
  '血压': {
    image: 'images/display/compressed/blood_pressure.jpg',
    description: '定期测量血压对老年人的健康管理非常重要。建议每天固定时间测量，保持记录，这样可以及时发现问题，帮助医生更好地了解您的健康状况。'
  },
  '旅游': {
    image: 'images/display/compressed/travel.jpg',
    description: '适度旅游不仅能让心情愉悦，还能增进身体健康。建议选择节奏较慢的旅游方式，注意劳逸结合，享受旅途中的美景和快乐时光。'
  },
  '茶': {
    image: 'images/display/compressed/tea.jpg',
    description: '喝茶不仅是一种享受，还能帮助提神醒脑、养生保健。建议选择适合自己的茶类，注意不要空腹饮茶，最好在饭后半小时饮用。'
  }
}

const DEFAULT_IMAGE = 'images/display/compressed/tea.jpg'

Page({
  data: {
    isRecording: false,
    currentImage: DEFAULT_IMAGE,
    description: serviceConfig['茶'].description,
    showDescription: true
  },

  onLoad() {
    // 检查录音权限
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        console.log('已获取录音权限')
      },
      fail: () => {
        console.error('获取录音权限失败')
        wx.showToast({
          title: '请授权录音权限',
          icon: 'none'
        })
      }
    })
  },

  // 图片加载错误处理
  onImageError(e) {
    console.error('图片加载失败:', e)
    console.log('当前图片路径:', this.data.currentImage)
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    })
  },

  // 图片加载成功处理
  onImageLoad(e) {
    console.log('图片加载成功:', this.data.currentImage)
  },

  // 开始语音输入
  startVoiceInput() {
    if (this.data.isRecording) {
      this.stopRecord()
    } else {
      this.startRecord()
    }
  },

  // 开始录音
  startRecord() {
    const recorderManager = wx.getRecorderManager()
    
    recorderManager.onStart(() => {
      console.log('录音开始')
      this.setData({
        isRecording: true,
        showDescription: false
      })
    })

    recorderManager.onError((res) => {
      console.error('录音失败', res)
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      })
    })

    recorderManager.onStop((res) => {
      console.log('录音结束', res)
      this.setData({
        isRecording: false
      })
      
      // 发送录音文件进行识别
      this.recognizeSpeech(res.tempFilePath)
    })

    // 开始录音
    recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    })
  },

  // 停止录音
  stopRecord() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()
  },

  // 语音识别
  recognizeSpeech(tempFilePath) {
    // 这里使用微信小程序的语音识别接口
    wx.showLoading({
      title: '正在识别...'
    })

    // 上传录音文件
    wx.uploadFile({
      url: 'YOUR_SERVER_URL', // 替换为您的服务器地址
      filePath: tempFilePath,
      name: 'file',
      success: (res) => {
        // 模拟语音识别结果
        this.processRecognitionResult('我想买把椅子')
      },
      fail: (error) => {
        console.error('上传失败', error)
        wx.showToast({
          title: '识别失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 处理识别结果
  processRecognitionResult(text) {
    console.log('识别结果:', text)
    
    // 匹配关键词
    for (const [keyword, service] of Object.entries(serviceConfig)) {
      if (text.includes(keyword)) {
        this.setData({
          currentImage: service.image,
          description: service.description,
          showDescription: true
        })
        return
      }
    }

    // 如果没有匹配到关键词
    wx.showToast({
      title: '没有找到相关服务',
      icon: 'none'
    })
  }
}) 