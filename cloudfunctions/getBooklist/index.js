// 获取诗词列表
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

var rp = require('request-promise');

const URL = 'https://api.jisuapi.com/tangshi/chapter?appkey=db669bc888f3dbdc'

const poemlistCollection = db.collection('poemlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  // const list = await poemlistCollection.get()
  const countResult = await poemlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = poemlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const poemlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })

  // 去重处理
  const newData = []
  for (let i = 0, len1 = poemlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (poemlist[i].detailid == list.data[j].detailid) {
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(poemlist[i])
    }
  }

  for (let i = 0, len = newData.length; i < len; i++) {
    await poemlistCollection.add({
      data: {
        ...newData[i], // ES6-扩展运算符
        creatTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }

  return newData.length
}