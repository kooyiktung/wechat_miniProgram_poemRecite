// pages/profile/profile.js
// const userInfo = wx.getStorageSync('userInfo')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countStar: 0,
    srcImg: '../../images/index.png',
    srcGo: '../../images/goAhead.png',
  },

  /**
    * go函数 
    */
  go: function () {
    wx.navigateTo({
      url: '../clickCal/clickCal',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  go1: function () {
    wx.navigateTo({
      url: '../studyHistory/studyHistory',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  go2: function () {
    wx.navigateTo({
      url: '../aboutUs/aboutUs',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  go3: function () {
    wx.navigateTo({
      url: '../useTips/useTips',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      countStar: app.globalData.user.star
    })
    // console.log(userInfo)
    // console.log(userInfo.nickName)
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

  }
})