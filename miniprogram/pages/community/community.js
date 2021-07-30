// pages/community/community.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentSelectType: 'grade',
    text: "田园",
    // png01: "../../images/01.png",
    // png02: "../../images/02.png",
    // png03: "../../images/03.png",
    // png04: "../../images/04.png",
  },

  // 更新data 切换选中状态
  selectedGrade: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },
  selectedTheme: function (e) {
    this.setData({
      currentSelectType: e.currentTarget.dataset.id
    })
  },

  /**
   * 页面跳转
   */
  link: function () {
    wx.navigateTo({
      url: '../group/group',
    })
  }

})