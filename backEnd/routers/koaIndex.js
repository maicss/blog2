/**
 * Created by maic on 24/09/2017.
 */

const router = require('koa-router')()

router
  .get('/', async ctx => {
    ctx.body = 'Hello World'
  })
  .post('/fun', async ctx => {
    console.log(ctx.request.body)
    ctx.body = ctx.request.body
  })
  .all('/indexImage', async ctx => {
    switch (ctx.method) {
      case 'get':
        break
      case 'post':
        break
      case 'delete':
        break
    }
  })
  .all('/moments', async ctx => {
    switch (ctx.method) {
      case 'get':
        break
    }
  })

module.exports = router

