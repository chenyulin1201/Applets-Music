// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const axios = require('axios')
// icode有效期为30天 过期需要去http://coding.imooc.com/learn/list/373.html 页面获取
const URL = 'https://apis.imooc.com/personalized?icode=BDFFA55E4011E6C3'
const db = cloud.database()
const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
    // 获取playlist集合里的所有数据，但是有个点需要注意的是云函数获取数据一次最多只能获取100条数据 如果从小程序端获取数据只能获取20条
    // const list = await playlistCollection.get()
    // 突破云函数获取只能获取100条数据限制
  // 返回一个对象 获取当前集合总条数
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for(let j = 0; j < batchTimes; j++) {
    // skip表示从第几条开始取
    let promise = playlistCollection.skip(j * MAX_LIMIT)
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = await promise.all(tasks).reduce((acc,cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const { data } = await axios.get(URL)
  if (data.code >= 1000){
    // 有问题 固定code大于等于1000说明请求有问题
    console.log(data.msg)
    return 0;
  }
  let playlist = data.result
  // 每次从服务器获取数据之后要和现有数据库里的数据进行去重
  let newData = []
  for(let i = 0;i < playlist.length; i++){
    let flag = true
    for(let k = 0;k < list.data.length; k++){
      if(playlist[i].id === list.data[i].id){
        flag = false
        break
      }
    }
    if (falg) {
      newData.push(playlist[i])
    }
  }
  playlist = newData
  if (playlist.length > 0) {
    // 操作数据库也是异步操作所以需要添加await
    await playlistCollection.add({
      data: [...playlist]
    }).then((res => {
      console.log('插入成功')
    })).catch((err) => {
      console.log('插入失败')
    })
  }
  return playlist.length
}