/**
 * Created by maic on 17/02/2017.
 */

const express = require('express')
const router = express.Router()
const path = require('path')
const {getUser} = require('../databaseOperation')

let multer = require('multer')
let storage = multer.diskStorage({
  destination (req, file, cb) {
    let path = './frontEnd/img/'
    cb(null, path + (req.headers.source || 'shuoshuo'))
  },
  filename (req, file, cb) {
    console.log(file)
    cb(null, new Date() * 1 + '-' + file.originalname)
  }
})

let upload = multer({storage})

console.log(upload)

const routerList = {
  shuoshuo: require('./shuoshuo'),
  getWeather: require('./weather'),
  user: require('./user'),
  blog: require('./blog'),
  github: require('./github'),
}

router
  .use(function (req, res, next) {
    if (!req.secure) {
      res.redirect('https://maicss.com' + req.path)
    } else {
      next()
    }
  })
  .use((req, res, next) => {
    // 验证身份
    if (req.method !== 'GET') {
      if (!req.cookies.uid) {
        res.status(401).json({error: 'please login and retry.'})
      } else {
        getUser({createTime: req.cookies.uid * 1})
          .then(d => {
            d.result.length ? next() : res.status(401).send({error: 'Please login and retry.'})})
          .catch(e => {e.status === 'error' ? res.status(400).send(d.result) : res.status(500).send(d.result)})
      }
    } else {
      next()
    }
  })
  .get('*', function (req, res, next) {
    switch (req.path) {
      case '/index':
      case '/':
        res.sendFile('/frontEnd/html/index.html', {"root": './'})
        break
      case '/shuoshuo':
        res.sendFile('/frontEnd/html/shuoshuo.html', {"root": './'})
        break
      case '/blog':
        res.sendFile('/frontEnd/html/blog.html', {"root": './'})
        break
      case '/googlee2a049d23b90511c.html':
        res.sendFile('/frontEnd/html/googlee2a049d23b90511c.html', {"root": './'})
        break
      default:
        next()
    }
  })
  // .get('/post/*', routerList.blog.post)

  // .get('/getTagPosts', routerList.blog.singleTag)
  // .post('/getPostsAbstract', routerList.blog.abstracts)
  .post('/blogImageUpload', upload.any(), routerList.blog.blogImageUpload)
  // .get('/getPostAllTags', routerList.blog.allTags)

  // .post('/github', routerList.github)

  .get('/getShuoshuoList', routerList.shuoshuo.getShuoshuoList)
  .post('/postShuoshuo', upload.any(), routerList.shuoshuo.postShuoshuo)
  .get('/getSummary', routerList.shuoshuo.getSummary)
  .delete('/deleteShuoshuo', routerList.shuoshuo.deleteShuoshuo)

  .get('/getWeather', routerList.getWeather)

  .post('/login', routerList.user.login)
  .post('/logout', routerList.user.logout)
  .use(express.static(path.resolve('./frontEnd/')))
  .use(function (req, res) {
    res.status(404).sendFile('/frontEnd/html/404.html', {"root": './'})
  })

module.exports = router


