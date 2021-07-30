import {
  formatSeconds
} from "../../utils/common.js";
let app = getApp();
const MAX_WORDS_NUM = 500; // 最大输入字数
const db = wx.cloud.database(); // 云数据库初始化
const _ = db.command
const util = require("../../utils/util.js")
const today = util.formatDate(new Date())
let content = '' // 接收输入的文字
const userInfo = wx.getStorageSync('userInfo')

Page({

  /**
   * 页面的初始数据
   */
  data: {

    textContent: '', // 用户输入的文本内容
    textContentLength: 0, // 输入的文字个数
    chooseImg: [], // 已选择的图片的本地路径
    selectPic: true, // 添加图片的button是否显示

    audioRecordManager: '', // 全局唯一的录音管理器 RecorderManager
    innerAudioContext: '', // 用于播放所录音频的内部audio上下文InnerAudioContext
    hiddenAudioRecordView: true, // 控制音频录制视图
    hiddenAddAudioBtn: false, // 控制添加音频按钮的显示、隐藏
    timer: '', // 计时器
    audioRecordTimeCount: 0, // 音频时长计数（秒）
    sec: '00', // 计时器 秒
    min: '00', // 计时器 分
    showPauseAudioRecordBtn: true, // 控制显示、隐藏暂停录音按钮
    audioRecordFileSrc: '', // 录音结束后 本地存储的音频文件地址

    showAudioPlayView: false, // 完成录音后 显示该录音的播放视图
    audioPlayStatus: 'pause', // 音频播放状态 pause => 暂停播放中 & play => 播放中
    audioPlayCurrTime: 0, // 音频当前播放时长 秒
    audioPlayCurrTimeStr: '00:00', // 音频当前播放时长 字符串
    audioPlayEndTime: 0, // 音频总时长 秒
    audioPlayEndTimeStr: '00:00', // 音频总时长 字符串

    address: "", // 用户选择的地理位置
    latitude: null, // 对应的纬度
    longitude: null, // 对应的经度

    index: 0,

    disabledPublishBtn: true, // 禁用true、不禁用false发表日记按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo,
    })
  },

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
    console.log('onUnload');
    // TODO 在发表日记过程退出 提示退出则上传失败 或进行后续处理
  },

  // 用户的输入文本内容的输入监听事件
  editTextContent: function(e) {
    let that = this;
    that.data.textContent = e.detail.value;
    let textContentLength = that.data.textContent.length
    that.data.disabledPublishBtn = !(
      (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
      that.data.audioRecordFileSrc.length > 0
    );
    console.log(e.detail.value);
    if (textContentLength >= MAX_WORDS_NUM) {
      textContentLength = `最大字数为${MAX_WORDS_NUM}`
    }
    that.setData({
      textContentLength,
      disabledPublishBtn: that.data.disabledPublishBtn
    });
    content = e.detail.value
  },

  // 选择图片
  chooseImage: function() {
    let that = this;

    // 当前可选的图片张数 总9张
    let remainNum = 9 - that.data.chooseImg.length;

    wx.chooseImage({
      count: remainNum,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        console.log(res);
        that.data.chooseImg = that.data.chooseImg.concat(res.tempFilePaths);

        that.data.disabledPublishBtn = !(
          (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
          that.data.audioRecordFileSrc.length > 0
        );

        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          chooseImg: that.data.chooseImg,
          disabledPublishBtn: that.data.disabledPublishBtn
        });

        console.log(that.data)

        // 还能选几张图片
        remainNum = 9 - that.data.chooseImg.length
        that.setData({
          selectPic: remainNum <= 0 ? false : true
        })
        // console.log(remainNum)
      }
    })
  },
  // 点击图片预览
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.chooseImg // 需要预览的图片http链接列表
    })
  },
  // 取消对应的已选图片 使用的catchtap 阻止事件冒泡去执行上层的图片预览事件
  cancelPictureUpload: function(e) {

    let that = this;
    let index = e.currentTarget.dataset.index;
    that.data.chooseImg.splice(index, 1); // 取消对应的图片

    // 设置日记发表按钮的状态（是否可以发表）
    that.data.disabledPublishBtn = !(
      (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
      that.data.audioRecordFileSrc.length > 0
    );

    that.setData({
      chooseImg: that.data.chooseImg,
      disabledPublishBtn: that.data.disabledPublishBtn
    });

    if (that.data.chooseImg.length == 8) {
      this.setData({
        selectPic: true,
      })
    }
  },

  // 录音计时器
  timer: function() {
    let that = this,
      intSec = that.data.audioRecordTimeCount % 60,
      intMin = Math.floor(that.data.audioRecordTimeCount / 60);
    if (that.data.audioRecordTimeCount >= 180) {
      that.endAudioRecord(); // 最长录音时间为3分钟
    }

    if (intSec < 10 && intSec >= 0)
      that.data.sec = '0' + intSec;
    else
      that.data.sec = '' + intSec;

    if (intMin < 10 && intMin >= 0)
      that.data.min = '0' + intMin;
    else
      that.data.min = '' + intMin;

    that.setData({
      sec: that.data.sec,
      min: that.data.min,
      audioRecordTimeCount: that.data.audioRecordTimeCount
    });

    that.data.timer = setTimeout(function() {
      that.data.audioRecordTimeCount += 1;
      that.timer();
    }, 1000);
  },

  // 点击开始录制音频
  startAudioRecord: function() {
    let that = this;
    that.setData({
      hiddenAudioRecordView: false,
      hiddenAddAudioBtn: true, // 点击添加录制音频的按钮后，隐藏该按钮
      audioRecordTimeCount: 0
    });

    that.data.audioRecordManager = wx.getRecorderManager();

    const options = {
      duration: 600000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    };

    //开始录音
    that.data.audioRecordManager.start(options);
    that.data.audioRecordManager.onStart(() => {
      that.timer();
      console.log('recorder start')
    });
    //错误回调
    that.data.audioRecordManager.onError((res) => {
      console.log(res);
    })
  },

  // 暂停录音
  pauseAudioRecord: function() {
    let that = this;
    clearTimeout(that.data.timer);
    that.data.audioRecordManager.pause();
    that.setData({
      showPauseAudioRecordBtn: false, // 暂停录音 此时显示继续录音按钮
    });
  },

  // 继续录音
  resumeAudioRecord: function() {
    let that = this;
    that.data.audioRecordManager.resume();
    that.timer();
    that.setData({
      showPauseAudioRecordBtn: true, // 正在录音 此时显示暂停录音按钮
    })
  },

  // 结束本次录音
  endAudioRecord: function() {
    let that = this;
    that.data.audioRecordManager.stop();
    that.data.audioRecordManager.onStop(function(res) {
      that.data.audioRecordFileSrc = res.tempFilePath;
      console.log(that.data.audioRecordFileSrc, 'audio record stop');
      // 设置日记发表按钮的状态（是否可以发表）
      that.data.disabledPublishBtn = !(
        (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
        that.data.audioRecordFileSrc.length > 0
      );

      that.setData({
        disabledPublishBtn: that.data.disabledPublishBtn
      });

    });
    clearTimeout(that.data.timer);
    that.data.audioPlayCurrTime = 0;
    that.data.audioPlayEndTime = that.data.audioRecordTimeCount;


    that.setData({
      hiddenAudioRecordView: true,
      showAudioPlayView: true, // 录音结束 显示该录音的播放视图
      audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),
    });

    // 录音结束后 创建用于播放所录音频的 内部audio上下文对象
    that.data.innerAudioContext = wx.createInnerAudioContext();
    // 音频文件的播放数据初始化
    that.setData({
      audioPlayCurrTime: 0, // 当前播放时间为0
      audioPlayCurrTimeStr: formatSeconds(0),

      audioPlayEndTime: that.data.audioPlayEndTime, // 音频总时长
      audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),

      audioPlayStatus: 'pause' // 设置音频的初始状态为暂停 显示播放按钮
    });

  },

  // 取消本次音频录制
  cancelAudioRecord: function() {
    let that = this;
    that.data.audioRecordManager.stop();
    clearTimeout(that.data.timer);
    that.data.audioRecordFileSrc = ''; // 重置录音文件的存储路径
    that.setData({
      hiddenAudioRecordView: true,
      hiddenAddAudioBtn: false,
      audioRecordTimeCount: 0, // 取消本次录音 重置计时器初始状态
      showPauseAudioRecordBtn: true, // 重置录音的控制按钮初始状态为开始录音
    });
  },

  // 开始播放录制好的音频
  startAudioPlay: function() {
    let that = this;
    that.data.innerAudioContext.src = that.data.audioRecordFileSrc; // 设置音频文件播放源
    that.data.innerAudioContext.play();
    // 动态修改播放时间和进度条
    that.data.innerAudioContext.onPlay(function() {

      that.data.innerAudioContext.onTimeUpdate(function() {
        that.data.audioPlayCurrTime = Math.floor(that.data.innerAudioContext.currentTime);
        that.data.audioPlayEndTime = Math.floor(that.data.innerAudioContext.duration);
        that.setData({
          audioPlayCurrTimeStr: formatSeconds(that.data.audioPlayCurrTime),
          audioPlayEndTimeStr: formatSeconds(that.data.audioPlayEndTime),
          audioPlayCurrTime: that.data.audioPlayCurrTime,
          audioPlayEndTime: that.data.audioPlayEndTime
        });
      });
    });

    // 设置音频播放至结束后的回调函数 设置结束后的控制按钮为播放按钮
    that.data.innerAudioContext.onEnded(function() {
      that.data.innerAudioContext.offTimeUpdate();
      setTimeout(function() {
        that.setData({
          audioPlayCurrTimeStr: '00:00',
          audioPlayCurrTime: 0
        });
        console.log(that.data.audioPlayCurrTime);
      }, 500);

      that.setData({
        audioPlayStatus: 'pause',
      });
    });


    that.setData({
      audioPlayStatus: 'play'
    });
  },

  // 暂停播放录制好的音频
  pauseAudioPlay: function() {
    let that = this;
    that.data.innerAudioContext.pause();
    that.data.innerAudioContext.onPause(function() {
      // 取消监听音频播放进度更新事件
      that.data.innerAudioContext.offTimeUpdate();
    });
    that.setData({
      audioPlayStatus: 'pause'
    });
  },

  // 取消本次录音音频的上传
  cancelAudioRecordUpload: function() {
    let that = this;
    // 结束音频播放
    that.data.innerAudioContext.stop();
    // 销毁当前实例
    that.data.innerAudioContext.destroy();

    that.data.audioRecordFileSrc = ''; // 重置录音文件的存储路径

    // 设置日记发表按钮的状态（是否可以发表）
    that.data.disabledPublishBtn = !(
      (that.data.textContent.length > 0 || that.data.chooseImg.length > 0) ||
      that.data.audioRecordFileSrc.length > 0
    );

    that.setData({
      disabledPublishBtn: that.data.disabledPublishBtn,
      showAudioPlayView: false,
      hiddenAddAudioBtn: false, // 取消本次录音音频上传后 则需要重新显示添加录音音频上传按钮
      audioRecordTimeCount: 0,
      min: '00',
      sec: '00'
    });
  },

  // 跳转到定位界面 结合腾讯地图进行位置选择
  chooseLocationAddress: function() {
    // 检测用户是否已经授权获取位置信息
    wx.getSetting({
      success: function(res) {
        // scope.userLocation === undefined 则说明用户第一次进入页面，尚未进行过位置信息授权
        // === false 则说明用户已经进入过该页面，但拒绝了授权获取位置信息
        // === true  则说明用户已经进入过该页面，并同意了授权获取位置信息
        console.log(res.authSetting['scope.userLocation']);

        if (res.authSetting['scope.userLocation'] === undefined) {
          // 当用户第一进入该页面时，wx.authorize会提前向用户发起授权请求
          // 无论用户选择了拒绝或者同意，再次进入页面后该授权窗口都不会被触发了
          wx.authorize(({
            scope: 'scope.userLocation',
            success: function(res) {
              // 只有授权成功后才能进入地图定位详细页面
              wx.navigateTo({
                url: "../position/position"
              });
            },
            fail: function(error) {
              console.log(error);
            }
          }))
        }

        if (res.authSetting['scope.userLocation'] === false) {
          // 若是用户拒绝了第一次进入页面wx.authorize触发的授权请求
          // 之后的授权只能通过进入设置页面来手动打开位置信息授权
          wx.showModal({
            content: '您暂未开启地理位置信息的授权，是否开启',
            success: function(res) {
              if (res.confirm) {
                // 打开小程序对应的设置页面
                wx.openSetting({
                  success: function(res) {
                    if (res.authSetting['scope.userLocation'] === true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      });
                      // 授权成功后进入地图定位界面
                      wx.navigateTo({
                        url: "../position/position"
                      });
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        }

        if (res.authSetting['scope.userLocation'] === true) {
          // 已经授权 直接进入地图定位界面
          wx.navigateTo({
            url: "../position/position"
          });
        }
      },
      fail: function(error) {
        console.log(error)
      }
    });
  },

  // 取消已选择的地理位置
  cancelLocationAddress: function() {
    let that = this;
    that.setData({
      address: "",
      latitude: null,
      longitude: null
    })
  },

  // 发表日记
  publishDiary: function() {

    wx.showLoading({
      title: '正在处理～',
      mask: true,
    });

    // 1.内容、图片、音频先上传到云存储(5G存储空间) 云存储返回fileID（即云文件ID）
    let promiseArr1 = []
    let fileIds = []
    // 图片上传
    for (let i = 0, len = this.data.chooseImg.length; i < len; i++) {
      let p1 = new Promise((resolve, reject) => {
        let item = this.data.chooseImg[i]
        // 图片文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'diary/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            // console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr1.push(p1)
    }
    // 音频上传
    let audioId = ''
    if (this.data.audioRecordFileSrc) {
      var audioRecordFilePath = this.data.audioRecordFileSrc
      const p2 = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'diary/' + String(Date.now()) + '-' + String(Math.random() * 10000000) + '.mp3',
          filePath: audioRecordFilePath,
          success: (res) => {
            // console.log(res)
            // console.log(res.fileID)
            audioId = res.fileID
            // console.log(audioId)
            resolve(audioId)
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr1.push(p2)
    }
    // 2.数据存储到云数据库
    // 数据库：获取内容、图片fileID、音频fileID、openid、昵称、头像、发布时间
    Promise.all(promiseArr1).then((res) => {
      db.collection('diary').add({
        data: {
          ...userInfo,
          content,
          audio: audioId,
          img: fileIds,
          createTime: db.serverDate(), //服务端时间
        }
      }).then((res) => {
        // this.check_in()
        wx.hideLoading()
        wx.showToast({
          title: '打卡成功',
          duration: 2000,
          success: function() {
            setTimeout(function() {
              // 返回日记界面 并刷新
              wx.navigateBack()
              const pages = getCurrentPages()
              console.log(pages)
              const prevPage = pages[pages.length - 2] //取到上一个界面
              prevPage.onPullDownRefresh()
            }, 3000);
          }
        })
      })
    }).catch((err) => {
      console.error(err)
      wx.hideLoading()
      wx.showToast({
        title: '打卡失败',
      })
      console.error(err)
    })
  },

  check_in() {
    db.collection('user').doc(app.globalData.openid).update({
      data: {
        star: _.inc(1),
        check_in: _.push(today)
      },
      success(res) {
        app.globalData.user.check_in.push(today)
        app.globalData.user.star++
          console.log("add_star_success")
      },
      fail(err) {
        console.log("add_star_err", err)
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})