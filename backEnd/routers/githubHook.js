/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../markdownRender')
const exec = require('child_process').exec

module.exports = function (req, res) {
  exec('git pull', function (err, stdout) {
    if (err) {
      res.send('git pull error: ', err)
    } else {
      if (stdout.trim() === 'Already up-to-date.') {
        res.send('Already up-to-date.')
      } else {
        scanAndRender.then(d => res.send(d)).catch(e => res.status(500).send(e.message))
      }
    }
  })
}