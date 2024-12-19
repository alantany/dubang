Component({
  properties: {
    text: {
      type: String,
      value: '点击开始录音'
    }
  },

  data: {
    isRecording: false
  },

  methods: {
    handleTap: function() {
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
          isRecording: true
        })
        this.triggerEvent('recordingStateChange', { isRecording: true })
        wx.showToast({
          title: '开始录音',
          icon: 'none'
        })
      })

      recorderManager.onStop((res) => {
        console.log('录音结束', res)
        this.setData({
          isRecording: false
        })
        this.triggerEvent('recordingStateChange', { 
          isRecording: false,
          tempFilePath: res.tempFilePath 
        })
        wx.showToast({
          title: '录音结束',
          icon: 'none'
        })
      })

      recorderManager.onError((res) => {
        console.error('录音失败:', res)
        this.setData({
          isRecording: false
        })
        this.triggerEvent('recordingError', res)
        wx.showToast({
          title: '录音失败',
          icon: 'error'
        })
      })

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
  }
}) 