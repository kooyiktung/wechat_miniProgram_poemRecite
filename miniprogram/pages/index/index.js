//获取应用实例
/*"plugin://calendar/calendar"*/
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    currentData: 0,
    src: '../../images/staryellow.png',
    src1: '../../images/starblue.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.hideTabBar({
      animation: true,
    })
    wx.showLoading({
      title: '正在登录',
    })
    var that = this;
    //查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              //用户授权成功后，调用微信的 wx.login 接口，从而获取code
              //*//
              // 调用云函数
              wx.cloud.callFunction({
                name: 'login',
                data: {
                  userInfo: wx.getStorageSync('userInfo')
                },
                success: res => {
                  app.globalData.openid = res.result.openid
                  app.globalData.user = res.result.user
                  console.log('[云函数] [login] user openid: ', app.globalData.openid, "\nuser", app.globalData.user)
                  that.setData({ user: app.globalData.user })
                  wx.showToast({
                    title: '登录成功！',
                    icon: 'success',
                    duration: 1000
                  })
                  wx.showTabBar({
                    animation: true,
                  })
                },
                fail: err => {
                  console.error('[云函数] [login] 调用失败', err)
                }
              })
              //*//
            }
          });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          wx.hideLoading()
          that.setData({
            isHide: true
          });
        }
      }
    });
  },

  //用户授权代码
  bindGetUserInfo: function (event) {
    const userInfo = event.detail.userInfo
    if (userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上
      console.log("用户的信息如下：");
      console.log(userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
      wx.setStorageSync('userInfo', userInfo)
      //**//
      wx.reLaunch({
        url: '../index/index',
      })
      //**//
      // // 抛出事件，用于传递用户的信息 triggerEvent是用于组件和页面引用该组件的数据传递
      //   that.triggerEvent('loginsuccess', userInfo)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },

  /**
   * 跳转到game界面
   */
  bindGame: function (options) {
    wx.navigateTo({
      url: "../game/game"
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
    this.setData({
      user: app.globalData.user
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

  /**
   * 获取当前滑块的index
   */
  bindchange: function (e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },
  /**
   * 点击切换，滑块index赋值
   */
  checkCurrent: function (e) {
    const that = this;

    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentData: e.target.dataset.current
      })
    }
  },
})