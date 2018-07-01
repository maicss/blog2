/**
 * Created by maic on 12/02/2017.
 */

const router = require('koa-router')()
const {getUser} = require('../database')
const {logger} = require('../utils')
const {env} = require('../../env')
const product = env === 'product'

const login = async (ctx) => {
  const {username, password, rememberMe} = ctx.request.body
  logger.info(`login action: IP => ${ctx.ip} info => ${JSON.stringify({username, password, rememberMe})}`)
  if (!username || !password) {
    ctx.throw(400)
  }
  let dbUser
  try {
    dbUser = await getUser({username})
  } catch (e) {
    return ctx.throw(401, 'Invalid username or password')
  }
  if (dbUser.length && dbUser[0].password === password) {
    if (rememberMe === true) {
      // cookie encrypt
      // let salt = 'naive';
      // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
      // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
      // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
      let maxAge = 10 * 24 * 60 * 60 * 1000 // 10d
      ctx.cookies.set('uid', dbUser[0].createTime.toString(), {maxAge, httpOnly: true, secure: product, sameSite: true})
      ctx.cookies.set('login', 'bingo', {maxAge, httpOnly: false, secure: product, sameSite: true})
    } else {
      ctx.cookies.set('uid', dbUser[0].createTime.toString(), {httpOnly: true, secure: product, sameSite: true})
      ctx.cookies.set('login', 'bingo', {httpOnly: false, secure: product, sameSite: true})
    }
    ctx.status = 200
  } else {
    return ctx.throw(401, 'Invalid username or password', {username, password})
  }
}

const logout = function (ctx) {
  ctx.cookies.set('uid', '')
  ctx.cookies.set('login', '')
  ctx.status = 200
}

router.post('/login', login)
router.post('/logout', logout)

module.exports = router
