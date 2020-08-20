const env = 'test-xyh-top250'
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env
})
const db = cloud.database({
  env
})
const fetch = require('./fetch')


function getUUID (n = 32) {
  var str = "abcdefghijklmnopqrstuvwxyz0123456789"; // 可以作为常量放到random外面
  var result = "";
  for(var i = 0; i < n; i++) {
    result += str[parseInt(Math.random() * str.length)];
  }
  return result;
}

async function getVideo(search) {
  const url = 'https://wq.432115.com/app/index.php?i=12&t=0&v=2.0.8&from=wxapp&c=entry&a=wxapp&do=Search&m=sg_movie&sign=5fd729908692800a8626918f80251e1d&key=x'
  const res = await fetch({
    url,
    params: {
      sign: getUUID(),
      key: search
    },
    method: 'get',
    timeout: 60000,
  });
  if(res && res.data && res.data.length) {
    let data = res.data[0]
    let urlList = []
    if(data.vod_play_url) {
      let list = `${data.vod_play_url || ''}`.split(data.vod_play_note)
      urlList = list.map(e => {
        let item = e.split('$')
        return {
          name: item[0],
          value: item[1]
        }
      })
    }
    return {
      videoName: data.vod_name,
      actor: data.vod_actor,
      videoType: data.vod_class,
      decs: data.vod_content,
      director: data.vod_director,
      coverImg: data.vod_pic,
      urlList
    }
  } else {
    return null
  }
}


// 云函数入口函数
// -1: 超管，1：其他
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try{
    let res = await getVideo(event.search)
    return res
  }catch (e) {
    return 0
  }

}
