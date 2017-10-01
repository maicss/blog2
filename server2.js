const Koa = require('koa')
const spdy = require('spdy')
const http = require('http')
const bodyParser = require('koa-body')()
const koaLogger = require('koa-logger')
const onerror = require('koa-onerror')
const compress = require('koa-compress')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const router = require('./backEnd/routers/koaIndex')
const {ports, credentials} = require('./env')
const spdyOption = {
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
// const app = new Koa()
app.use(bodyParser)
// app.use(koaLogger())
app.use(compress({
  filter: function (content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
// onerror(app)



// x-response-time

app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(router.routes(), router.allowedMethods())

if (!module.parent) {
  app.listen(ports.secure)
  http.createServer(app.callback()).listen(ports['non-secure'])
}

// app.on('error', err => console.log(err))
console.log('server on https://localhost:' + ports.secure)

module.exports = app