Page({
  data: {
    isRecording: false,
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
      }
    })
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
        isRecording: true
      })
    })

    recorderManager.onError((res) => {
      console.error('录音失败', res)
    })

    recorderManager.onStop((res) => {
      console.log('录音结束', res)
      this.setData({
        isRecording: false
      })
      // TODO: 将录音发送给AI服务进行处理
    })

    // 开始录音
    recorderManager.start({
      duration: 60000, // 最长录音时间，单位ms
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 96000, // 编码码率
      format: 'mp3' // 音频格式
    })
  },

  // 停止录音
  stopRecord() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()
  }
}) 