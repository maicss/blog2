/**
 * Created by maic on 24/09/2017.
 */

const router = require('koa-router')()

const {ports} = require('../../env')
const indexImage = require('./koaIndexImage')

router
  .use(async (ctx, next) => {
    if (!ctx.secure) {
      ctx.redirect('https://' + ctx.hostname + ':' + ports.secure + ctx.path)
    } else {
      await next()
    }
  })
  .get('/', async ctx => {
    ctx.body = 'Hello World'
  })
  .post('/fun', async ctx => {
    console.log(ctx.request.body)
    ctx.body = ctx.request.body
  })
  .use('/indexImage', indexImage.routes())

module.exports = router

