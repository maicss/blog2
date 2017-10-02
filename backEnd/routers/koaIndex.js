/**
 * Created by maic on 24/09/2017.
 */

const path = require('path')
const fs = require('fs')

const router = require('koa-router')()

const {ports} = require('../../env')
const indexImage = require('./koaIndexImage')
const user = require('./koaUser')
const moments = require('./koaMoments')
const {getUser} = require('../database')

const {logger, saveFileFromStream} = require('../utils')

const identificationCheck = async (ctx, next) => {
  // check identification middleware
  let isLogin = false
  if (!ctx.cookies.get('uid')) {
    if (ctx.method === 'GET' || ctx.path === '/login') {
      ctx.login = isLogin
      await next()
    } else {
      return ctx.throw(401, 'Please login and retry.')
    }
  } else {
    const user = await getUser({createTime: ctx.cookies.get('uid') * 1})
    isLogin = !!user.length
    if (ctx.method === 'GET' || ctx.path === '/login') {
      ctx.login = isLogin
      await next()
    } else {
      if (isLogin) {
        await next()
      } else {
        return ctx.throw(401, 'Please login and retry.')
      }
    }
  }
}

const imageUploader = async (ctx, next) => {
  // 图片上传中间件
  const basePath = 'frontEnd/img/'
  if (!ctx.headers.source) return ctx.throw(400, 'Missing source filed in headers.')
  if ((ctx.path === '/fun' || ctx.path === '/imageUploader') && ctx.method === 'POST' && ctx.request.body && ctx.request.body.files) {
    let files;
    if (Array.isArray(ctx.request.body.files.photo)) {
      files = ctx.request.body.files.photo
    } else {
      files = [ctx.request.body.files.photo]
    }
    await saveFileFromStream(files, basePath + ctx.headers.source)
    await next()
  } else {
    await next()
  }
}

router
  .use(async (ctx, next) => {
    if (!ctx.secure) {
      ctx.redirect('https://' + ctx.hostname + ':' + ports.secure + ctx.path)
    } else {
      await next()
    }
  })
  .use(imageUploader)
  .post('/fun', async ctx => {
    logger.info(ctx.request.body)
    ctx.body = ctx.request.body
  })
  .use(identificationCheck)
  .get('/', async ctx => {
    ctx.body = 'Hello World'
  })
  .get('/googlee2a049d23b90511c.html', async ctx => {
    ctx.type = 'html'
    ctx.body = fs.createReadStream('frontEnd/static/googlee2a049d23b90511c.html');
  })
  .use('/indexImage', indexImage.routes())
  .use('/moments', moments.routes())
  .post('/login', user.routes())
  .post('/logout', user.routes())
  .use('*', async ctx => {
    // 所有的其他请求都交给vue的404处理
    ctx.type = 'html'
    ctx.body = fs.createReadStream('frontEnd/static/index.html');
  })

module.exports = router

