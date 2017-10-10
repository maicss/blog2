const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const rmFile = promisify(fs.unlink)
const Router = require('koa-router')
const _request = require('request').defaults({encoding: null})

const {logger} = require('../utils')
const {saveIndexImage, getIndexImage, updateIndexImage, deleteIndexImage} = require('../database')
const crawler = require('../500pxCrawler')
const likedDir = 'frontEnd/img/index/liked/'
const tempDir = 'frontEnd/img/index/temp/'
const router = Router()

const downloadFile = (url, path) => {
  return new Promise((resolve, reject) => {
    _request(url, (err, res, body) => {
      if (err) return reject(err)
      fs.writeFile(path, body, e => {
        if (e) return reject(e)
        resolve('done')
      })
    })
  })
}

/**
 * 每天的定时爬取图片的任务
 * */
const cron = async () => {
  try {
    // 先爬取信息
    let crawledImages = await crawler()
    logger.info('crawledImages: ', crawledImages.length)
    // 去数据库去重
    const newImages = await Promise.all(crawledImages.map(img => saveIndexImage(img)))
    logger.info('newImages: ', newImages.length)
    logger.info('newImages[0]: ', newImages[0])
    // 下载图片
    const downloadInfo = await Promise.all(newImages.map(img => downloadFile(img.url, tempDir + img.id + '.' + img.format)))
    logger.info('downloadInfo: ', downloadInfo)
    // 删除下载失败的
    const succeed = downloadInfo.map((info, i) => info === 'done' ? newImages[i] : undefined).filter(v => v)
    const failedIds = downloadInfo.map((info, i) => info === 'done' ? undefined : newImages[i].id)
    await Promise.all(failedIds.map(id => deleteIndexImage(id)))
    return succeed
  } catch (e) {
    logger.error(e)
  }
}

const _mvFile = (source, target) => {

  return new Promise((resolve, reject) => {
    const done = (err) => {
      if (err) return reject(err)
      fs.unlink(source, function (e) {
        if (e) reject(e)
        return resolve()
      })
    }
    let targetDir = path.dirname(target)
    if (!fs.existsSync(targetDir)) {
      done(targetDir + ' is not exist.')
    }

    const rd = fs.createReadStream(source)
    rd.on('error', function (err) {
      done(err)
    })
    const wr = fs.createWriteStream(target)
    wr.on('error', function (err) {
      done(err)
    })
    wr.on('close', function () {
      done()
    })
    rd.pipe(wr)
  })
}

const getOneImg = async () => {
  let tempImages = await getIndexImage('temp')
  logger.info(tempImages.length)
  if (tempImages.length) {
    return tempImages[~~(Math.random() * tempImages.length)]
  } else {
    const likedImages = await getIndexImage('like')
    logger.info(tempImages.length)
    if (likedImages.length) {
      return likedImages[~~(Math.random() * likedImages.length)]
    } else {
      let crawledImages = await cron()
      return crawledImages[~~(Math.random() * crawledImages.length)]
    }
  }
}

const getOneImage = async ctx => {
  const image = await getOneImg()
  const _path = (image.type === 'temp' ? tempDir : likedDir).replace('frontEnd/', '') + image.id + '.' + image.format
  ctx.body = Object.assign({path: _path}, image._doc)
}

const likePicture = async ctx => {
  /**
   * 传入一个图片名称[123.jpeg]进行操作
   * @return {Boolean}
   * */
  const {imageName} = ctx.request.body
  const {name: id} = path.parse(imageName)
  await _mvFile(tempDir + imageName, likedDir + imageName)
  let _res
  try {
    _res = await updateIndexImage(Number(id), 'like')
  } catch (e) {
    ctx.throw(400, e.message)
  }
  if (_res.name) {
    ctx.body = true
  } else {
    ctx.throw(400, 'Invalid image name.')
  }
}

const dislikePicture = async ctx => {
  const imageName = ctx.query.imageName
  const {name: id} = path.parse(imageName)
  await rmFile(tempDir + imageName)
  await updateIndexImage(Number(id), 'dislike')
  ctx.body = await getOneImg()
}

router
  .get('/', getOneImage)
  .put('/', likePicture)
  .delete('/', dislikePicture)

/**
 * 开启服务器的时候先爬一次
 * */
// cron().then(() => logger.info('daily image crawled success.')).catch(e => logger.warn(e))

/**
 * 然后每天中午12点爬一次
 * */
setTimeout(function () {
  // 下面两种不确定用哪个好，先用计算都这种吧
  const someDaysNoon = 1507262400000 // 2017-10-06 12:00:00
  if ((Date.now() - someDaysNoon) % 86400000 < 1000) {
    // const _now = new Date()
    // const time = _now.getHours()+''+_now.getMinutes()+_now.getSeconds()
    // if (time === '1200'){
    cron().then(() => logger.info('daily image crawled success.')).catch(e => logger.warn(e))
  }
}, 1000)

module.exports = router

// const img = {"name" : "СПб", "author" : "maratneva", "width" : 1680, "height" : 1114, "id" : 230250209, "format" : "jpeg", "url" : "https://drscdn.500px.org/photo/230250207/m%3D2048/v2?user_id=20263175&webp=true&sig=c23d03848a2497acdc78002b2aead5d8862ec570503f27b9a3f2696c263945af", "type" : "temp", "__v" : 0 }

// _request(img.url, (err, res, body) => {
//   if (err) return console.error(err)
//   fs.writeFile(img.id + '.' + img.format, body, e => {
//     if (e) return console.error(e)
//     console.log(111)
//   })
// })

// downloadFile(img.url, img.id + '.' + img.format).then(d => console.log(d)).catch(e => console.error(e))