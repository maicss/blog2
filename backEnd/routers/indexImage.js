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
    logger.info('tempImages: ', tempImages)
    let likedImages
    if (tempImages.length) {
      return tempDir + tempImages[0]
    } else if (likedImages = await listDir(likedDir)) {
      likedImages = likedImages.filter(file => !file.startsWith('.'))
      logger.info('likedImages: ', likedImages)
      if (likedImages.length) {
        return likedDir + likedImages[0]
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
  // 先看看temp文件夹里有没有图片，如果没有就看喜欢的文件夹里有没有，如果还没有就用爬虫爬一下
  // todo 然后用socket 通知客户端有图片了？这个等等再弄
  (async () => {
    try {
      let _res = await getOneImg()
      logger.info(_res)
      res.send(_res)
    } catch (e) {
      res.status(500).send(e)
    }
  })()

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

// getOneImg().then(d => console.log(d))

// console.log(path.join( tempDir, 'aa.jpg'))

crawler().then(d => console.log(d))
