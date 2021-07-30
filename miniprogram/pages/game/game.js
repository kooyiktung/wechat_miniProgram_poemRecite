let interval = null
const app = getApp()
const db = wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    wordList: [],
    resultList: [],
    poemList: [],
    selectedPoem: [],
    curIndex: 0,
    curAnswer: '',
    downCount: 30,
    errorCount: 0,
    pause: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    const { curIndex } = this.data
    const { result: res } = await wx.cloud.callFunction({
      name: 'booklist',
      data: {
        poemId: 1,
        $url: 'poemdetail'
      }
    })
    const { result: { content, title } } = res
    const poem = content.replace(/[\w\s<>=\/\"]+/g, '').replace(/[，。]+/g, '#').split('#')
    const poemList = poem.slice(0, poem.length - 1)

    // 设置第一个答案
    const curAnswer = poemList[curIndex]
    // 除了答案剩下的选项
    const restPoemWords = poemList.slice(1).join('')
    // 从剩下的随机取四个（可以根据诗的长度选择随机取多少个）
    const randomWords = restPoemWords.split('').sort(() => Math.random() - 0.5).slice(0, 4).join('')

    // 组成九宫格
    const poemWords = curAnswer + randomWords
    const wordList = poemWords.split('').map(item => ({ name: item, isSelected: false })).sort(() => Math.random() - 0.5)

    // 开始倒计时
    this.handleDownCountChange()

    // 设置标题栏
    wx.setNavigationBarTitle({
      title
    })

    this.setData({
      poemList,
      curAnswer,
      wordList
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
    this.setData({ downCount: 0 })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({ downCount: 0 })
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

  // 监听九宫格选择
  handleBoxClick: function (e) {
    const { currentTarget: { dataset } } = e
    const { index } = dataset
    const wordList = this.data.wordList
    const resultList = this.data.resultList

    // 判断是否选完5个
    const isFinished = resultList.length === 5

    // 更新选中样式
    const selectedName = wordList[index].name
    if (wordList[index].isSelected) {
      wordList[index].isSelected = false
      const deleteIndex = resultList.findIndex(item => item === selectedName)
      resultList.splice(deleteIndex, 1)
    } else if (isFinished) {
      return
    } else {
      wordList[index].isSelected = true
      resultList.push(selectedName)
    }

    this.setData({
      wordList,
      resultList,
    })
  },

  // handleResultDelete: function (e) {
  //   const { currentTarget: { dataset } } = e
  //   const { index } = dataset
  //   const resultList = this.data.resultList
  //   resultList.splice(index, 1)
  //   this.setData({
  //     resultList
  //   })
  // },

  // 选对时触发
  handleAnswerCorrect: function () {
    const { curIndex, poemList, selectedPoem } = this.data
    const temp = [...poemList]
    const newIndex = curIndex + 1
    const curAnswer = temp.splice(newIndex, 1)[0]

    this.setData({
      curAnswer,
      downCount: 30,
      curIndex: newIndex,
      selectedPoem
    })

    wx.showToast({
      title: '选对了'
    })

    if (newIndex === 4) {
      app.add_star(4, app.globalData.openid)
      app.globalData.user.star += 4
      this.setData({ pause: true })
      wx.showToast({
        title: '全对!获得4颗星!',
        duration: 3000,
        success: function () {
          setTimeout(function () {
            wx.navigateBack()
          }, 3000);
        }
      })
    }

    // 重置一下九宫格
    if (newIndex != 4)
      this.handlePoemReset()
  },

  // 监听提交
  handleSubmit: function (e) {
    const { resultList, curAnswer, wordList, errorCount, selectedPoem } = this.data
    // 3次机会
    if (errorCount === 3) {
      this.setData({ pause: true })
      wx.showToast({
        title: '游戏失败！=_=',
        icon: 'none',
        duration: 3000,
        success: function () {
          setTimeout(function () {
            wx.navigateBack()
          }, 3000);
        }
      })
      return
    }
    const selectedResult = resultList.join('')
    console.log('正确答案: ', curAnswer)
    console.log('您选择的: ', selectedResult)
    console.log('')

    if (selectedResult === curAnswer) {
      selectedPoem.push(curAnswer)
      this.handleAnswerCorrect()
    } else {
      this.setData({
        resultList: [],
        wordList: wordList.map(item => ({
          ...item,
          isSelected: false
        })),
        errorCount: errorCount + 1,
        selectedPoem
      })
      wx.showToast({
        title: `错了，还有${2 - errorCount}次机会`,
        icon: 'none'
      })
      this.setData({
        downCount: 30
      })
    }
  },
  // 监听倒计时
  handleDownCountChange: function () {
    clearInterval(interval)
    interval = setInterval(() => {
      if (!this.data.pause && this.data.downCount > 0) {
        const { downCount } = this.data
        const newDownCount = downCount - 1
        this.setData({
          downCount: newDownCount
        })
        if (newDownCount === 0) {
          wx.showToast({
            title: '时间到了!',
            icon: 'none',
            duration: 3000,
            success: function () {
              setTimeout(function () {
                wx.navigateBack()
              }, 3000);
            }
          })
          clearInterval(interval)
        }
      }
    }, 1000)
  },
  // 重置九宫格（与初始化类似）
  handlePoemReset: function () {
    const { poemList, curIndex } = this.data
    const temp = [...poemList]
    const curAnswer = temp.splice(curIndex, 1)[0]
    const restPoemWords = temp.join('')
    const randomWords = restPoemWords.split('').sort(() => Math.random() - 0.5).slice(0, 4).join('')
    const poemWords = curAnswer + randomWords
    const wordList = poemWords.split('').map(item => ({ name: item, isSelected: false })).sort(() => Math.random() - 0.5)
    this.setData({
      curAnswer,
      wordList,
      resultList: []
    })
  },
})