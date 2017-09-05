/**
 * Created by maic on 17/02/2017.
 */

const express = require('express')
const router = express.Router()
const path = require('path')
let multer = require('multer')

const {ports} = require('../../env')
const {logger} = require('../utils')
const {getUser} = require('../databaseOperation')

let storage = multer.diskStorage({
  destination (req, file, cb) {
    let path = './frontEnd/img/'
    cb(null, path + (req.headers.source || 'moments'))
  },
  filename (req, file, cb) {
    cb(null, new Date() * 1 + '-' + file.originalname)
  }
})

let upload = multer({storage})

const routerList = {
  moments: require('./moments'),
  getWeather: require('./weather'),
  user: require('./user'),
  blog: require('./blog'),
  github: require('./githubHook'),
}

router
  .use(function (req, res, next) {
    if (!req.secure) {
      res.redirect('https://' + req.hostname + ':' + ports.secure + req.path)
    } else {
      next()
    }
  })
  .use((req, res, next) => {
    // check identification middleware
    let isLogin = false
    if (!req.cookies.uid) {
      isLogin = false
      next()
    } else { 
      getUser({createTime: req.cookies.uid * 1})
      .then(d => {
        isLogin = !!d.result.length
        if (req.method === 'GET' || req.path === '/login') {
          // pass the login info
          req.login = isLogin
          next()
        } else {
          // response not login error
          isLogin ? next() : res.status(401).send({message: 'Please login and retry.'})
        }
      })
      .catch(e => console.error('check identification middleware error: ', e))
     }
  })
  .get('*', function (req, res, next) {
    switch (req.path) {
      case '/index':
      case '/':
        res.sendFile('/frontEnd/html/index.html', {"root": './'})
        break
      case '/moments':
        res.sendFile('/frontEnd/html/moments.html', {"root": './'})
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
  .post('/fun', (req, res) => {
    res.send(req.body)
  })
  .get('/blog/*', (req, res) => res.sendFile('/frontEnd/archives/' + req.params[0] + '.html', {"root": './'}))
  .get('/getBlog/*', routerList.blog.getBlog)
  .get('/blogList', routerList.blog.getBlogList)
  .get('/getBlogImageInfo', routerList.blog.blogImageInfo)
  .post('/blogImageUpload', upload.any(), routerList.blog.blogImageUpload)
  .get('/blogSummary', routerList.blog.getBlogSummary)

  .post('/github', routerList.github)

  .get('/getMomentsList', routerList.moments.getMomentsList)
  .post('/postMoments', upload.any(), routerList.moments.postMoments)
  .get('/getSummary', routerList.moments.getSummary)
  .delete('/deleteMoments', routerList.moments.deleteMoments)

  .get('/getWeather', routerList.getWeather)

  .post('/login', routerList.user.login)
  .post('/logout', routerList.user.logout)
  .use(express.static(path.resolve('./frontEnd/')))
  .use(function (req, res) {
    res.status(404).sendFile('/frontEnd/html/404.html', {"root": './'})
  })

module.exports = router


