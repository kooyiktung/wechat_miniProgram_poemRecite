// pages/poem/poem.js
var WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentSelectType: 'poem',
    poemInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.cloud.callFunction({
      name: 'booklist',
      data: {
        poemId: options.poemId,
        $url: 'poemdetail'
      }
    }).then((res) => {
      // console.log(res)
      const pdl = res.result.result
      var content = pdl.content
      var appreciation = pdl.appreciation
      var explanation = pdl.explanation
      // console.log(pdl.explanation)
      WxParse.wxParse('content', 'html', content, this, 5) //WxParse的用法
      WxParse.wxParse('appreciation', 'html', appreciation, this, 5)
      WxParse.wxParse('explanation', 'html', explanation, this, 5)
      this.setData({
        poemInfo: {
          title: pdl.title,
          author: pdl.author,
          content: pdl.content,
          appreciation: pdl.appreciation,
          explanation: pdl.explanation
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 更新data 切换选中状态
  selectedPoe: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },
  selectedTrans: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },
  selectedCom: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },
  selectedApp: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },
  selectedPin: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },
  selectedVid: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },

})