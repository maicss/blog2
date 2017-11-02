const http = require('http')
const fs = require('fs')
const Koa = require('koa')
const spdy = require('spdy')

const bodyParser = require('koa-body')
const koaLogger = require('koa-logger')
const onerror = require('koa-onerror')
const helmet = require('koa-helmet')
const compress = require('koa-compress')
const staticServer = require('koa-static')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const router = require('./backEnd/routers/koaIndex')
const {ports, credentials, env} = require('./env')
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

if (env === 'product' && credentials.chain) {
  spdyOption.cert = credentials.chain
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
app.use((ctx, next) => {
  if (!ctx.secure && ctx.method === 'GET') {
    ctx.status = 302
    return ctx.redirect('https://' + ctx.hostname + ':' + ports.secure + ctx.path)
  }
  return next()
}).use(async (ctx, next) => {
  if (ctx.headers['content-type'] === 'application/csp-report') {
    ctx.headers['content-type'] = 'application/json'
  }
  await next()
})
// const app = new Koa()
app.use(bodyParser({multipart: true}))
// app.use(koaLogger())
// if (env === 'product'){
//   app.use(helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ['\'self\''],
//         scriptSrc: ["'self'", '\'unsafe-inline\'', 'https://www.google-analytics.com', 'https://api.github.com', 'https://www.googletagmanager.com', 'https://pagead2.googlesyndication.com', 'https://adservice.google.com', "'unsafe-eval'"],
//         fontSrc: ["'self'", 'data:'],
//         styleSrc: ["'self'", '\'unsafe-inline\''],
//         reportUri: '/report-violation',
//         frameSrc: ["https://googleads.g.doubleclick.net"],
//         connectSrc: ["'self'", 'https://googleads.g.doubleclick.net', 'https://api.github.com', 'https://gh-oauth.imsun.net/'],
//         imgSrc: ["'self'", 'https://www.google-analytics.com', 'https://googleads.g.doubleclick.net', 'https://www.google.com', 'https://www.google.cn', 'https://stats.g.doubleclick.net', 'data:', 'blob:', 'https://avatars2.githubusercontent.com', 'https://www.google.co.jp'],
//         objectSrc: ["'none'"]
//       }
//     }
//   }))
// }
app.use(compress())
onerror(app)

// x-response-time

app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})
app.use(staticServer('frontEnd', {maxage: 86400000}))
app.use(router.routes(), router.allowedMethods())
app.use(async (ctx, next) => {
  await next()
  if (ctx.method === 'GET') {
    // 所有的其他请求都交给vue的404处理
    ctx.type = 'html'
    ctx.body = fs.createReadStream('frontEnd/index.html')
  } else {
    ctx.throw(404, 'Not Found')
  }

})

if (!module.parent) {
  app.listen(ports.secure)
  http.createServer(app.callback()).listen(ports['non-secure'])
}

// app.on('error', err => console.log(err))
console.log('server on https://localhost:' + ports.secure)

module.exports = app
