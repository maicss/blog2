const Koa = require('koa')
const spdy = require('spdy')
const bodyParser = require('koa-body')()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const router = require('./backEnd/routers/koaIndex')
const {ports, credentials} = require('./env')
spdyOption = {
  key: credentials.key,
  // cert: credentials.chain,
  cert: credentials.cert,
  spdy: {
    protocols: ['h2', 'spdy/3.1', 'http/1.1'],
    plain: false,
    'x-forwarded-for': true,
    connection: {
      windowSize: 1024 * 1024, // Server's window size

      // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
      autoSpdy31: false
    }
  }
}

class KoaOnHttps extends Koa {
  constructor () {
    super()
  }

  listen () {
    const server = spdy.createServer(spdyOption, this.callback())
    return server.listen.apply(server, arguments)
  }
}

const app = new KoaOnHttps()
app.use(bodyParser)

app
  .use(router.routes())
  .use(router.allowedMethods())

// x-response-time

app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

if (!module.parent) app.listen(ports.secure)
console.log('server on https://localhost:' + ports.secure)