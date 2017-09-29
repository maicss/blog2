const moment = require('moment')
const marked = require('maic-marked')
const {getMomentsList, saveMoments, getMomentsSummary, deleteMoments, updateMoments} = require('../database')
const fs = require('fs')
const unlink = require('util').promisify(fs.unlink)
const path = require('path')
module.exports = {
  getMomentsList (req, res) {
    let condition = {}
    condition.isPublic = !req.login
    if (req.query.filter && req.query.filter !== 'all') {
      condition.dateStr = new RegExp('^' + req.query.filter)
    }
    condition.page = Number(req.query.page)
    condition.limit = Number(req.query.limit)
    getMomentsList(condition)
      .then(d => res.json(d))
      .catch(e => res.status(500).send(e.message))
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

      saveMoments(content)
        .then(d => res.send(d.result))
        .catch(e => res.status(500).send(e.message))
    } catch (e) {
      res.status(400).send({
        error: 'JSON Parse Error in post data: ' + req.body.obj
      })
    }
  },

  getSummary (req, res) {
    getMomentsSummary()
      .then(d => res.json(d))
      .catch(e => res.status(500).send(e.message))
  },

  updateMoments (req, res) {
    let content = new marked().exec(req.body.content).html
    updateMoments({date: req.body.date, content})
      .then(d => res.json(d))
      .catch(e => e.status === 'error' ? res.status(400).send(e.message) : res.status(500).send(e.message))
  },

  deleteMoments: async (req, res) => {
    /**
     * 删除一个说说。先根据说说的date查找说说，然后删除说说的图片，再执行数据库删除
     *
     * */
    try {
      let query = {date: req.query.date * 1}
      const moments = await getMomentsList(query)
      if (moments[0] && moments[0].images.length) {
        await unlink(path.resolve(__dirname, '../../frontEnd' + _path))
      }
      const _res = await deleteMoments(query.date)
      res.send(_res)
    } catch (e) {
      res.status(500).send(e.message)
    }
  }
}
