const moment = require('moment')
const marked = require('maic-marked')
const {getShuoshuoList, saveOneShuoshuo, getShuoshuoSummary, deleteShuoshuo} = require('../databaseOperation')
const fs = require('fs')
const path = require('path')
module.exports = {
  getShuoshuoList (req, res) {
    let condition = {}
    condition.isPublic = !(req.cookies.login === 'bingo')
    if (req.query.filter && req.query.filter !== 'all') {
      condition.dateStr = new RegExp('^' + req.query.filter)
    }
    if (req.query.timeMark && req.query.timeMark !== '0') {
      condition.timeMark = req.query.timeMark
    }
    condition.limit = Number(req.query.limit) || 10
    getShuoshuoList(condition)
      .then(d => res.json(d.result))
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  },

  postShuoshuo (req, res) {

    let date = moment()
    try {
      let body = JSON.parse(req.body.obj)
      body.isPublic = true
      if (body.content.trim().startsWith('pre-')) {
        body.isPublic = false
        body.content = body.content.substring(body.content.indexOf('pre-') + 'pre-'.length)
      }
      let content = {
        'date': date * 1,
        'dateStr': date.format(),
        'weather': body.weather,
        'content': new marked().exec(body.content).html,
        'images': [],
        'isPublic': body.isPublic
      }

      console.log(req.files)

      req.files.forEach(function (v) {
        content.images.push(v.path.substring('frontEnd'.length))
      })

      saveOneShuoshuo(content)
        .then(d => res.send(d.result))
        .catch(e => console.log(e))
    } catch (e) {
      res.status(400).send({
        error: 'JSON Parse Error in post data: ' + req.body.obj
      })
    }
  },

  getSummary (req, res) {
    getShuoshuoSummary()
      .then(d => res.json(d.result[0].content))
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  },

  deleteShuoshuo (req, res) {
    let query = {date: req.query.date * 1}
    getShuoshuoList(query)
      .then(d => {
        if (d.result[0] && d.result[0].images.length) {
          try {
            d.result[0].images.forEach(_path => {
              console.log(path.resolve(__dirname, '../../frontEnd' + _path))
              fs.unlinkSync(path.resolve(__dirname, '../../frontEnd' + _path))
            })
          } catch (e) {
            res.status(500).send({error: 'delete shuoshuo image failed'})
          }
        }
        deleteShuoshuo(query)
          .then(d => res.send(d))
          .catch(e => e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result))
      })
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  }
}
