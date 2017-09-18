const request = require('request-promise')

module.exports = function (req, res) {
  let ip = ''
  if (req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
    ip = Math.random() > 0.5 ? '116.246.19.150' : '112.22.233.200'
  } else if (req.ip.startsWith('::ffff:')) {
    ip = req.ip.substring('::ffff:'.length)
  } else {
    throw new Error('IP exception: ', req.ip)
  }
  request(`https://api.seniverse.com/v3/weather/daily.json?key=cqihb9cchivbqjl8&location=${ip}&start=0&days=3`)
    .then(d => res.json(JSON.parse(d)))
    .catch(e => res.status(500).send(e))

}
