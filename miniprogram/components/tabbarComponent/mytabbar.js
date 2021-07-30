// tabbarComponent/mytabbar.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mytabbar: {
      type: Object,
      value: {
        "backgroundClolr": "#ffffff",
        "color": "#979795",
        "selectedColor": "#0094FF",
        "list": [
          {
            "pagePath": "/pages/rankList/rankList",
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
            "pagePath": "/pages/bookList/bookList",
            "iconPath": "icon/booklist.png",
            "selectedIconPath": "icon/booklist_HL.png",
            "text": "诗集"
          }
        ]
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIphoneX: app.globalData.systemInfo.model == "iPhone X" ? true : false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // onLoginSuccess(event){
    //   console.log(event)
    // },
    // onLoginFail(){}
    
  }
})