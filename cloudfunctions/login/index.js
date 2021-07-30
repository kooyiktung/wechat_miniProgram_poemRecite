// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
//获取用户信息，存储到数据库中
exports.main = async (event, context) => {
  
  const wxContext = cloud.getWXContext()

  console.log("querying user")
  const user =await db.collection('user').where({_id:wxContext.OPENID}).get()
  if(user.data.length <= 0){
    console.log("no_user  registering……")
    var new_user=await db.collection('user').add({
      data:{        
        userInfo: event.userInfo,
        _id:wxContext.OPENID,
        star:0,
        check_in:[]
      }
    })
    console.log("querying user2")
    const user2 =await db.collection('user').where({_id:wxContext.OPENID}).get()
    return {
      openid: wxContext.OPENID,
      user: user2.data[0],
      user_num: user_num
    }
  }
  else{
    return {
      openid: wxContext.OPENID,
      user: user.data[0],
      user_num: user_num
    }
  }
}

