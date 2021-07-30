//app.js
App({
  onLaunch: function() {
    //获取设备信息
    this.getSystemInfo();

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'XXXX', //the name of the environment
        traceUser: true,
      })
    }
    //this.globalData = {}
    
  },
  getSystemInfo: function() {
    let t = this;
    wx.getSystemInfo({
      success: function(res) {
        t.globalData.systemInfo = res;
        t.globalData.height = res.statusBarHeight
        // console.log("高度为" + t.globalData.height)
      }
    });
  },
  editTabbar: function() {
    let mytabbar = this.globalData.mytabBar;
    let currentPages = getCurrentPages();
    let _this = currentPages[currentPages.length - 1];
    let pagePath = _this.route;

    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);


    // if(pagePath.indexOf('/') != 0){
    //   pagePath = '/' + pagePath;
    // } 

    for (let i in mytabbar.list) {
      mytabbar.list[i].selected = false;
      (mytabbar.list[i].pagePath == pagePath) && (mytabbar.list[i].selected = true);
    }
    _this.setData({
      mytabbar: mytabbar
    });
  },
  
  add_star(add_num, openid) {
    console.log("add_star", add_num, "_id", openid)
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('user').doc(openid).update({
      data: {
        star: _.inc(add_num)
      },
      success(res) {
        console.log("add_star_success")
      },
      fail(err) {
        console.log("add_star_err", err)
      }
    })
  },

  globalData: {
    height: 0, //顶部高度
    mytabbar: {
      "backgroundClolr": "#ffffff",
      "color": "#979795",
      "selectedColor": "#0094FF",
      "list": [{
          "pagePath": "/pages/ranklist/ranklist",
          "iconPath": "icon/ranklist.png",
          "selectedIconPath": "icon/ranklist_HL.png",
          "text": "榜单"
        },
        {
          "pagePath": "/pages/public/public",
          "iconPath": "icon/clickin.png",
          "isSpecial": true,
          "text": "发布"
        },
        {
          "pagePath": "/pages/booklist/booklist",
          "iconPath": "icon/booklist.png",
          "selectedIconPath": "icon/booklist_HL.png",
          "text": "诗集"
        }
      ]
    }
  }
})