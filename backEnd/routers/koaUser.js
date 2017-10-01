/**
 * Created by maic on 12/02/2017.
 */

const router = require('koa-router')()
const {getUser} = require('../database')
const {logger} = require('../utils')

const login = async (ctx) => {
  try{
    const {username, password, rememberMe} = ctx.request.body
    const dbUser = await getUser({username})
    if (dbUser.length && dbUser[0].password === password) {
      if (rememberMe === true) {
        // cookie encrypt
        // let salt = 'naive';
        // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
        // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
        // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
        let maxAge = 10 * 24 * 60 * 60 * 1000 // 10d
        ctx.cookies.set('uid', dbUser[0].createTime, {maxAge, httpOnly: true, secure: true})
        ctx.cookies.set('login', 'bingo', {maxAge, secure: true})
      } else {
        ctx.cookies.set('uid', dbUser[0].createTime, {httpOnly: true, secure: true})
        ctx.cookies.set('login', 'bingo', {secure: true})
      }
      ctx.status = 200
    } else {
      return ctx.throw(401, 'Invalid username or password', {username, password})
    }
  } catch (e) {
    // todo 上面的throw 会被这里catch掉，也是醉醉的
    if (e.message === 'Cannot find user.' || e.message === 'Invalid username or password') {
      return ctx.throw(401, e.message)
    } else {
      return ctx.throw(500, e.message)
    }
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
