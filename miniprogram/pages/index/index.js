// index.js
Page({
  data: {
    text: '点击开始录音'
  },

  tapTest: function() {
    if (this.data.isRecording) {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  },

  startRecording: function() {
    const recorderManager = wx.getRecorderManager()
    
    recorderManager.onStart(() => {
      console.log('录音开始')
      this.setData({
        text: '点击结束录音',
        isRecording: true
      })
      wx.showToast({
        title: '开始录音',
        icon: 'none'
      })
    })

    recorderManager.onStop((res) => {
      console.log('录音结束', res)
      this.setData({
        text: '点击开始录音',
        isRecording: false
      })
      wx.showToast({
        title: '录音结束',
        icon: 'none'
      })
      
      // 播放录音
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.src = res.tempFilePath
      innerAudioContext.play()
    })

    recorderManager.onError((res) => {
      console.error('录音失败:', res)
      this.setData({
        text: '点击开始录音',
        isRecording: false
      })
      wx.showToast({
        title: '录音失败',
        icon: 'error'
      })
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

  stopRecording: function() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()
  }
})