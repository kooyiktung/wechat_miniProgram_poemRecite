// 云函数配置
// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

const rp = require('request-promise')

const BASE_URL = 'https://api.jisuapi.com/tangshi/detail?appkey=db669bc888f3dbdc'

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('poemlist', async(ctx, next) => {
    ctx.body = await cloud.database().collection('poemlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('detailid', 'asc')
      .get()
      .then((res) => {
        return res
      })
  })

  app.router('poemdetail', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + '&detailid=' + parseInt(event.poemId))
      .then((res) => {
        return JSON.parse(res)
        // console.log(BASE_URL + '&detailid=' + parseInt(event.poemId))
      })
  })

  return app.serve()
}