const request = require('request-promise')
const router = require('koa-router')()

const weather = async ctx => {
  let ip = ''
  if (ctx.ip === '::1' || ctx.ip === '::ffff:127.0.0.1') {
    ip = Math.random() > 0.5 ? '116.246.19.150' : '112.22.233.200'
  } else if (ctx.ip.startsWith('::ffff:')) {
    ip = ctx.ip.substring('::ffff:'.length)
    if (ip.startsWith('10.200')) {
      ip = Math.random() > 0.5 ? '116.246.19.150' : '112.22.233.200'
    }
  } else {
    throw new Error('IP exception: ', ctx.ip)
  }
  const weather = await request(`https://api.seniverse.com/v3/weather/daily.json?key=cqihb9cchivbqjl8&location=${ip}&start=0&days=3`)
  ctx.body = JSON.parse(weather)
}
router.get('/', weather)

module.exports = router