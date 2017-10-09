const path = require('path')
const unlink = require('util').promisify(require('fs').unlink)

const marked = require('maic-marked')
const {getMomentsList, saveMoments, getMomentsSummary, deleteMoments, updateMoments} = require('../database')
const router = require('koa-router')()
const {logger} = require('../utils')

const momentsList = async (ctx) => {
  let condition = {}
  condition.isPublic = !ctx.login
  if (ctx.query.filter && ctx.query.filter !== 'all') {
    condition.dateStr = new RegExp('^' + ctx.query.filter)
  }
  condition.page = Number(ctx.query.page)
  condition.limit = Number(ctx.query.limit)
  try {
    ctx.body = await getMomentsList(condition)
  } catch (e) {
    return ctx.throw(400, e.message)
  }
}

const postMoments = async (ctx) => {
  let date = new Date()
  const dateStr = date.getFullYear() + '-'
    + (date.getMonth() + 1).toString().padStart(2, '0') + '-'
    + date.getDate().toString().padStart(2, '0') + ' '
    + date.getHours().toString().padStart(2, '0') + ':'
    + date.getMinutes().toString().padStart(2, '0') + ':'
    + date.getSeconds().toString().padStart(2, '0')
  let body
  try {
    body = JSON.parse(ctx.request.body.fields.moments)
  } catch (e) {
    return ctx.throw(400, 'parse body json error: ' + e.message)
  }
    body.isPublic = true
    if (body.content.trim().startsWith('pre-')) {
      body.isPublic = false
      body.content = body.content.substring(body.content.indexOf('pre-') + 'pre-'.length)
    }
    let content = {
      'date': date * 1, dateStr,
      'weather': body.weather,
      'content': new marked().exec(body.content).html,
      'images': [],
      'isPublic': body.isPublic
    }

    ctx.request.body._files.forEach(function (v) {
      content.images.push(v.path.substring('frontEnd'.length))
    })

    ctx.body = await saveMoments(content)
}

const getSummary = async (ctx) => {
  return ctx.body = await getMomentsSummary()
}

const _updateMoments = async (ctx) => {
  let content = new marked().exec(ctx.request.body.content).html
  ctx.body = await updateMoments({date: ctx.request.body.date, content})
}

/**
 * 删除一个说说。先根据说说的date查找说说，然后删除说说的图片，再执行数据库删除
 *
 * */
const _deleteMoments = async ctx => {
  let query = {date: ctx.query.date * 1}
  let moments
  try {
    moments = await getMomentsList(query)
  } catch (e) {
    ctx.throw(400, e.message)
  }
  if (moments[0] && moments[0].images.length) {
    await Promise.all(moments[0].images.map(_path => unlink(path.resolve(__dirname, '../../frontEnd' + _path))))
  }
  ctx.body = await deleteMoments(query.date)
}

router.get('/list', momentsList)
router.post('/', postMoments)
router.get('/summary', getSummary)
router.delete('/', _deleteMoments)
router.put('/', _updateMoments)

module.exports = router