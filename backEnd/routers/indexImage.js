const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const rmFile = promisify(fs.unlink)

const {logger} = require('../utils')
const {saveIndexImage, getIndexImage, updateIndexImage} = require('../databaseOperation2')
const crawler = require('../500pxCrawler')
const likedDir = 'frontEnd/img/index/liked/'
const tempDir = 'frontEnd/img/index/temp/'


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

const getBGI = (req, res) => {
  getOneImg().then(d => {
    let _path = (d.type === 'temp' ? tempDir : likedDir).replace('frontEnd/', '') + d.id + '.' + d.format
    let m = Object.assign(d.toObject(), {path: _path})
    res.send(m)
  }).catch(e => res.status(500).send(e.message))
}

const likePicture = async (req, res) => {
  /**
   * 传入一个图片名称[123.jpeg]进行操作
   * @return {Boolean}
   * */
  try {
    const imageName = req.body.imageName
    const {name: id} = path.parse(imageName)
    await _mvFile(tempDir + imageName, likedDir + imageName)
    let _res = await updateIndexImage(Number(id), 'like')
    if (_res.name) {
      res.send(true)
    } else {
      res.status(500).send('Invalid image name.')
    }
  } catch (e) {
    res.status(500).send(e.message)
  }
}

const dislikePicture = async (req, res) => {
  try {
    const imageName = req.query.imageName
    const {name: id} = path.parse(imageName)
    await rmFile(tempDir + imageName)
    await updateIndexImage(Number(id), 'dislike')
    let newImage = await getOneImg()
    res.send(newImage)
  } catch (e) {
    res.status(500).send(e.message)
  }
}

/**
 * 开启服务器的时候先爬一次
 * */
cron()

/**
 * 然后每天爬一次
 * */
setTimeout(cron, 86400 * 1000)

module.exports = {
  getBGI,
  likePicture,
  dislikePicture
}

// _mvFile('img/index/temp/227293929.jpeg', 'img/index/liked/227293929.jpeg').then(d=> console.log(d)).catch(e=> console.error(e))