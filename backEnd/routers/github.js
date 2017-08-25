/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../scanMD')
const exec = require('child_process').exec

module.exports = function (req, res) {
  exec('git pull', function (err, stdout) {
    if (err) {
      console.error('git pull error: ', err)
    } else {
      if (stdout.trim() === 'Already up-to-date.') {
        res.send('Already up-to-date.')
      } else {
        scanAndRender(function (r) {
          if (r === 'prefect') {
            console.info('scan and render succeed.')
          } else if (r === 'nothing new') {
            console.info('nothing new.')
          } else {
            console.error('scan and render failed.')
          }
          res.json(r)
        })
      }
    }
  })

}