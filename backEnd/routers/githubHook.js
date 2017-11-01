/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../markdownRender')
const exec = require('child_process').exec
const {logger} = require('../utils')

const _pull = async () => {
  return new Promise((res, rej) => {
    exec('git pull', function (err, stdout) {
      if (err) {
        logger.error('git pull error: ', err)
        return rej(err)
      }
      if (stdout.trim() === 'Already up-to-date.') {
        logger.info('git pull: Already up-to-date')
        res('Already up-to-date')
      } else {
        logger.info('git pull: something new')
        res('something new')
      }
    })
  })
}

module.exports = async ctx => {
  const r = await _pull()
  if (r === 'something new') {
    ctx.body = await scanAndRender()
  } else {
    ctx.body = 'Already up-to-date'
  }

}