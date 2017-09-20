const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const rmFile = promisify(fs.unlink)
const renameFile = promisify(fs.rename)
const listDir = promisify(fs.readdir)

const {saveIndexImage, getIndexImage, updateIndexImage} = require('../databaseOperation2')
const crawler = require('../500pxCrawler')
const {logger} = require('../utils')
const likedDir = 'img/index/liked/'
const tempDir = 'img/index/temp/'

const _mvFile = (source, target) => {

  return new Promise((resolve, reject) => {
    const done = (err) => {
      if (err) return reject(err)
      fs.unlink(source, function (e) {
        if (e) reject(e)
        return resolve()
      })
    }
    console.log('CopyFile', source, target)
    let targetDir = path.dirname(target)
    if (!fs.existsSync(targetDir)) {
      cb(targetDir + 'is not exist.')
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
    } else if (likedImages = await getIndexImage('liked')){
      if (likedImages.length) {
        return likedImages[~~(Math.random() * likedImages.length)]
      }
    } else {
      let crawledImages = await crawler()
      await Promise.all(crawledImages.map(img => saveIndexImage(img)))
      return crawledImages[~~(Math.random() * crawledImages.length)]
    }
  } catch (e) {
    logger.info('step into this')
    return e
  }
}

const getBGI = (req, res) => {
  getOneImg().then(d => {
    // todo 去数据库查询图片信息并一并返回
    let _path = (d.type === 'temp' ? tempDir : likedDir) + d.id + '.' + d.format
    let m = Object.assign(d._doc, {path: _path})
    logger.info(m)
    res.send(m)
  }).catch(e => res.status(500).send(e))
}

const likePicture = (req, res) => {
  const imageName = req.params[0]
  (async () => {
    try {
      await _mvFile(tempDir + imageName, likedDir + imageName)
      res.send('Liked operator succeed')
    } catch (e) {
      res.status(500).send(e)
    }
  })()
}

const dislikePicture = (req, res) => {
  const imageName = req.params[0]
  (async () => {
    await rmFile(tempDir + imageName)
    // todo choose one file and send
    let newImage = await getOneImg()
    // todo path test
    res.send(path.join('img/index/' + newImage))
  })()
}

module.exports = {
  getBGI,
  likePicture,
  dislikePicture
}
