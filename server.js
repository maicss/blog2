const express = require('express')
const compression = require('compression')
const http = require('http')
const https = require('https')
const spdy = require('spdy')
// this is just add a default format to moment, because this file always load first
const moment = require('moment')
const cookieParser = require('cookie-parser')

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss'

const credentials = require('./env').credentials
const ports = require('./env').ports

const routers = require('./backEnd/routers/routers')
const CORS = function (req, res, next) {
  // console.log()
  res.header('Access-Control-Allow-Origin', req.get('origin'))
  res.header('Access-Control-Max-Age', 864000)
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if ('OPTIONS' === req.method) {
    res.sendStatus(200)
  }
  else {
    next()
  }
}

let bodyParser = require('body-parser')

let app = express()

app.use(compression())
app.use(cookieParser())
// app.use(CORS)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let httpServer = http.createServer(app)
// let httpsServer = https.createServer(credentials, app);

spdyOption = {
  key: credentials.key,
  cert: credentials.chain,
  // cert: credentials.cert,
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

app.use(routers)

spdy
  .createServer(spdyOption, app)
  .listen(ports.secure, (error) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    }
  })

httpServer.listen(ports['non-secure'])
// httpsServer.listen(ports.secure);
console.log('server on https://localhost:' + ports.secure)

/*
 * node like python single file internal test
 * if __name__ == '__main__'
 * if (require.main === module)
 * */