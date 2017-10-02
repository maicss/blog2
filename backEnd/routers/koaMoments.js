const moment = require('moment')
const marked = require('maic-marked')
const {getMomentsList, saveMoments, getMomentsSummary, deleteMoments, updateMoments} = require('../database')
const path = require('path')
const unlink = require('util')
const router = require('koa-router')()
const {logger} = require('../utils')

const momentsList = async (ctx) => {
  try {
    let condition = {}
    condition.isPublic = !ctx.login
    if (ctx.query.filter && ctx.query.filter !== 'all') {
      condition.dateStr = new RegExp('^' + ctx.query.filter)
    }
    condition.page = Number(ctx.query.page)
    condition.limit = Number(ctx.query.limit)
    ctx.body = await getMomentsList(condition)
  } catch (e) {
    if (e.message === 'Invalid moments query condition') {
      return ctx.throw(400, e.message)
    } else {
      return ctx.throw(500, e.message)
    }
  }
}

const postMoments = async (ctx) => {

  let date = moment()
  let body = ctx.request.body.moments
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

  ctx.request.files.forEach(function (v) {
    content.images.push(v.path.substring('frontEnd'.length))
  })

  ctx.body = await saveMoments(content)
}

const getSummary = async (ctx) => {
  return ctx.body = await getMomentsSummary()
}

const _updateMoments = async (ctx) => {
  let content = new marked().exec(ctx.request.body.content).html
  return ctx.body = await updateMoments({date: ctx.request.body.date, content})
}

const _deleteMoments = async (ctx, res) => {
  /**
   * 删除一个说说。先根据说说的date查找说说，然后删除说说的图片，再执行数据库删除
   *
   * */
  try {
    let query = {date: ctx.query.date * 1}
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

router.get('/', momentsList)
router.post('/', postMoments)
router.get('/summary', getSummary)
router.delete('/', _deleteMoments)
router.put('/', _updateMoments)

module.exports = router