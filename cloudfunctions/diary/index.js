// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()

const diaryCollection = db.collection('diary')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async (ctx, next) => {
   let diaryList = await diaryCollection.skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc').get().then((res)=>{
      return res.data
    })
    ctx.body = diaryList
  })

  return app.serve()
}