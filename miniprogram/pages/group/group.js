// pages/group/group.js
// 获取应用实例
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modelShow: false, //控制底部弹出层是否显示
    currentData: 0,
    mytabbar: {},
    zhi: '../../images/zhi.jpeg',
    diaryList: []
  },

  //评论发布
  onPublish(){
    this.setData({
      modelShow: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadDiaryList()
  },

  _loadDiaryList(start = 0){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'diary',
      data: {
        start,
        count: 10,
        $url: 'list',
      }
    }).then((res) => {
      this.setData({
        diaryList: this.data.diaryList.concat(res.result)
        // diaryList: [1,2,3,4,5,6,7,8]
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
      // console.log(this.data.diaryList)
    })
  },

  /**
   * 监听页面滚动
   */
  // onPageScroll: function (e) {
  //   this.setData({
  //     scrollTop: e.scrollTop
  //   })
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      diaryList:[]
    })
    this._loadDiaryList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._loadDiaryList(this.data.diaryList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    
  },

  //获取当前滑块的index
  bindchange: function(e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },
  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    const that = this;
    that.setData({
      currentData: e.currentTarget.dataset.tab
    })
    if (e.currentTarget.dataset.tab == 1) {
      db.collection('user').get({
        success: function (res) {
          that.setData({
            members: res.data
          })
        },
        fail: console.error
      })
    }
  }
})