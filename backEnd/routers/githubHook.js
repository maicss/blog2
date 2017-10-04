/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../markdownRender')
const exec = require('child_process').exec

module.exports = async ctx => {
  exec('git pull', function (err, stdout) {
    if (err) {
      ctx.throw(500, err)
    } else {
      if (stdout.trim() === 'Already up-to-date.') {
        ctx.body = 'Already up-to-date.'
      } else {
        scanAndRender.then(d => ctx.body = d).catch(e => ctx.throw(e))
      }
    }
  })
}