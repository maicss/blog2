const fs = require('fs')
const path = require('path')
const promisify= require('util').promisify
const rmFile = promisify(fs.unlink)
const renameFile = promisify(fs.rename)
const listDir = promisify(fs.readdir)
const likedDir = ''
const tempDir = '../routers'

const _mvFile = async (prev, dist) => {
  // 使用rename先试试，不行就使用stream copy
  try {
    await renameFile(prev, dist)
  } catch (e) {
    try {
      const oldStream = await fs.createReadStream(prev)
      const newStream = await fs.createWriteStream(dist)
      oldStream.pipe(newStream)
      rmFile(prev)
    } catch (errorInStream) {
      return errorInStream
    }
  }
}

const getOneImg = async () => {
  const tempImages = await listDir(tempDir)
  let likedImages
  if (tempImages.length) {
    return tempDir + tempImages[0]
  } else if (likedImages = await listDir(likedDir)){
    if (likedImages.length) {
      return likedDir + likedImages[0]
    }
  } else {
    // todo exec image crawler
  }
}

const getBGI = (req, res) => {
  // 先看看temp文件夹里有没有图片，如果没有就看喜欢的文件夹里有没有，如果还没有就用爬虫爬一下
  // todo 然后用socket 通知客户端有图片了？这个等等再弄
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
  const imageName =  req.params[0]
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

getOneImg().then(d => console.log(d))
