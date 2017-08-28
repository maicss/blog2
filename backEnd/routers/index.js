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
    // check identificate middleware
    let isLogin = false
    if (!req.cookiss.uid) {
      isLogin = false
    } else { 
      getUser({createTime: req.cookies.uid * 1})
      .then(d => login = !!d.result.length)
      .catch(e => login = false)
     }
    if (req.method === 'GET' || req.path === '/login') {
      // pass the login info
      req.login = isLogin
      next()
     } else {
       // response not login error
       isLogin ? next() : res.send({error: 'Please login and retry.'})
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
  // .get('/post/*', routerList.blog.post)
  .get('/blogList/*', router.blog.getBlogList)
  // .get('/getTagPosts', routerList.blog.singleTag)
  // .post('/getPostsAbstract', routerList.blog.abstracts)
  .post('/blogImageUpload', upload.any(), routerList.blog.blogImageUpload)
  // .get('/getBlogSummary', routerList.blog.allTags)

  // .post('/github', routerList.github)

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


