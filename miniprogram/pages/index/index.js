// index.js
Page({
  data: {
    buttonText: '点击测试',
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

  handleTap() {
    console.log('按钮被点击了')
    wx.showToast({
      title: '点击成功',
      icon: 'success'
    })
  }
})