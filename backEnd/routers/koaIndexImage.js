const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const rmFile = promisify(fs.unlink)
const Router = require('koa-router')

const {logger} = require('../utils')
const {saveIndexImage, getIndexImage, updateIndexImage} = require('../database')
const crawler = require('../500pxCrawler')
const likedDir = 'frontEnd/img/index/liked/'
const tempDir = 'frontEnd/img/index/temp/'
const router = Router()

/**
 * 每天的定时爬取图片的任务
 * */
const cron = async () => {
  try {
    let crawledImages = await crawler()
    await Promise.all(crawledImages.map(img => saveIndexImage(img)))
    return crawledImages
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
  try {
    let tempImages = await getIndexImage('temp')
    let likedImages
    if (tempImages.length) {
      return tempImages[~~(Math.random() * tempImages.length)]
    } else if (likedImages = await getIndexImage('liked')) {
      if (likedImages.length) {
        return likedImages[~~(Math.random() * likedImages.length)]
      }
    } else {
      let crawledImages = await cron()
      return crawledImages[~~(Math.random() * crawledImages.length)]
    }
  } catch (e) {
    return e
  }
}

const getOneImage = async ctx => {
  const image = await getOneImg()
  const _path = (image.type === 'temp' ? tempDir : likedDir).replace('frontEnd/', '') + image.id + '.' + image.format
  // todo 创建一个indexImage类，做到这里可以直接console.assert
  return ctx.body = Object.assign({path: _path}, image._doc)
}

const likePicture = async ctx => {
  /**
   * 传入一个图片名称[123.jpeg]进行操作
   * @return {Boolean}
   * */
  try {
    const {imageName} = ctx.body
    const {name: id} = path.parse(imageName)
    await _mvFile(tempDir + imageName, likedDir + imageName)
    let _res = await updateIndexImage(Number(id), 'like')
    if (_res.name) {
      ctx.body = true
    } else {
      ctx.throw(400, 'Invalid image name.')
    }
  } catch (e) {
    ctx.throw(500, e.message)
  }
}

const dislikePicture = async ctx => {
  try {
    const imageName = ctx.query.imageName
    const {name: id} = path.parse(imageName)
    await rmFile(tempDir + imageName)
    await updateIndexImage(Number(id), 'dislike')
    ctx.body  = await getOneImg()
  } catch (e) {
    ctx.throw(500, e.message)
  }
}

router
  .get('/', getOneImage)
  .put('/', likePicture)
  .delete('/', dislikePicture)

/**
 * 开启服务器的时候先爬一次
 * */
// cron().then(() => logger.info('daily image crawled success.'))

/**
 * 然后每天爬一次
 * */
// setTimeout(cron, 86400 * 1000)

module.exports = router