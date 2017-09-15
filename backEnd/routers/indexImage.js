const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const rmFile = promisify(fs.unlink)
const renameFile = promisify(fs.rename)
const listDir = promisify(fs.readdir)

const crawler = require('../500pxCrawler')
const {logger} = require('../utils')
const likedDir = './frontEnd/img/index/liked'
const tempDir = './frontEnd/img/index/temp/'

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
    let tempImages = await listDir(tempDir)
    tempImages = tempImages.filter(file => !file.startsWith('.'))
    let likedImages
    if (tempImages.length) {
      let index = ~~(Math.random() * tempImages.length)
      return tempDir + tempImages[index]
    } else if (likedImages = await listDir(likedDir)) {
      likedImages = likedImages.filter(file => !file.startsWith('.'))
      let index = ~~(Math.random() * likedImages.length)
      if (likedImages.length) {
        return likedDir + likedImages[index]
      }
    } else {
      // todo 没有走这个分支
      console.log(1)
      let flag = await crawler()
      if (flag) {
        getOneImg()
      }
    }
  } catch (e) {
    logger.info('step into this')
    return e
  }
}

const getBGI = (req, res) => {
  getOneImg().then(d => {
    // todo 去数据库查询图片信息并一并返回
    logger.info(d)
    res.send(d.replace('./frontEnd', ''))
  }).catch(e => res.status(500).send(e))
}

// 暂时不考虑空文件夹的情况

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
