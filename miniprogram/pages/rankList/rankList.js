// pages/rankList/rankList.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNav: 'rank',
    navs: [{
      text: '排行',
      alias: 'rank'
    }, {
      text: '日签',
      alias: 'mark'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this;
    db.collection('user').orderBy('star', 'desc').get({
      success: function (res) {
        for (var i = 0; i < res.data.length; i++) {
          res.data[i]["idx"] = i + 1
          if (res.data[i]["_id"] == app.globalData.user._id) {
            that.setData({ self_rank: i + 1 })
          }
        }
        that.setData({
          members: res.data,
        })
      },
      fail: console.error
    })
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

  changeList(e) {
    console.log(e.target.dataset.alias);
    const that = this;
    const alias = e.target.dataset.alias;

    if (alias !== this.data.activeNav) {
      this.setData({
        activeNav: e.target.dataset.alias,
        loading: true
      });
    }
  },

})