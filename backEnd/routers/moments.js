const moment = require('moment')
const marked = require('maic-marked')
const {getMomentsList, saveOneMoments, getMomentsSummary, deleteMoments} = require('../databaseOperation')
const fs = require('fs')
const path = require('path')
module.exports = {
  getMomentsList (req, res) {
    let condition = {}
    condition.isPublic = req.login
    if (req.query.filter && req.query.filter !== 'all') {
      condition.dateStr = new RegExp('^' + req.query.filter)
    }
    condition.page = Number(req.query.page)
    condition.limit = Number(req.query.limit)
    getMomentsList(condition)
      .then(d => res.json(d.result))
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  },

  postMoments (req, res) {

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

      req.files.forEach(function (v) {
        content.images.push(v.path.substring('frontEnd'.length))
      })

      saveOneMoments(content)
        .then(d => res.send(d.result))
        .catch(e => e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result))
    } catch (e) {
      res.status(400).send({
        error: 'JSON Parse Error in post data: ' + req.body.obj
      })
    }
  },

  getSummary (req, res) {
    getMomentsSummary()
      .then(d => res.json(d.result[0].content))
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  },

  deleteMoments (req, res) {
    let query = {date: req.query.date * 1}
    getMomentsList(query)
      .then(d => {
        if (d.result[0] && d.result[0].images.length) {
          try {
            d.result[0].images.forEach(_path => {
              fs.unlinkSync(path.resolve(__dirname, '../../frontEnd' + _path))
            })
          } catch (e) {
            res.status(500).send({error: 'delete moments image failed'})
          }
        }
        deleteMoments(query)
          .then(d => res.send(d))
          .catch(e => e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result))
      })
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  }
}
