/**
 * Created by maic on 17/02/2017.
 */

const express = require('express')
const router = express.Router()
const path = require('path')
let multer = require('multer')

const {ports} = require('../../env')
const {logger} = require('../utils')
const {getUser} = require('../database')

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

const identificationCheck = function (req, res, next) {
  // check identification middleware
  let isLogin = false
  if (!req.cookies.uid) {
    if (req.method === 'GET' || req.path === '/login') {
      req.login = isLogin
      next()
    } else {
      res.status(401).send({message: 'Please login and retry.'})
    }
  } else {
    getUser({createTime: req.cookies.uid * 1})
      .then(d => {
        isLogin = !!d.length
        if (req.method === 'GET' || req.path === '/login') {
          // pass the login info
          req.login = isLogin
          next()
        } else {
          isLogin ? next() : res.status(401).send({message: 'Please login and retry.'})
        }
      })
      .catch(e => logger.error('check identification middleware error: ', e))
  }
}

const routerList = {
  moments: require('./moments'),
  getWeather: require('./weather'),
  user: require('./user'),
  blog: require('./blog'),
  github: require('./githubHook'),
  indexImage: require('./indexImage')
}

router
  .use(function (req, res, next) {
    // console.log(req.method, req.path)
    if (!req.secure) {
      res.redirect('https://' + req.hostname + ':' + ports.secure + req.path)
    } else {
      next()
    }
  })
  .use(identificationCheck)
  .get('*', function (req, res, next) {
    switch (req.path) {
      case '/index':
      case '/':
        res.sendFile('/frontEnd/index.html', {'root': './'})
        break
      case '/googlee2a049d23b90511c.html':
        res.sendFile('/frontEnd/static/googlee2a049d23b90511c.html', {'root': './'})
        break
      default:
        next()
    }
  })
  .post('/fun', (req, res) => {
    console.log(req.body)
    res.json(req.body)
  })
  .get('/indexImage', routerList.indexImage.getBGI)
  .put('/indexImage', routerList.indexImage.likePicture)
  .delete('/indexImage', routerList.indexImage.dislikePicture)
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
  .put('/updateMoments', routerList.moments.updateMoments)

  .get('/getWeather', routerList.getWeather)

  .post('/login', routerList.user.login)
  .post('/logout', routerList.user.logout)
  .get('/noRes', () => {})
  .use(express.static(path.resolve('./frontEnd/')))
  .use(function (req, res) {
    res.sendFile('/frontEnd/index.html', {'root': './'})
    // res.status(404).sendFile('/frontEnd/static/404.html', {'root': './'})
  })

module.exports = router


