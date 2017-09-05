/**
 * Created by maic on 01/03/2017.
 */
const fs = require('fs')
path = require('path');
const promisify = require('util').promisify
const lstat = promisify(fs.lstat)
const readdir = promisify(fs.readdir)
const {
  getBlogList,
  updateBlogProp,
  getBlogSummary
} = require('../databaseOperation')
const {
  logger
} = require('../utils')

const getBlogImageInfo = async() => {
  let total = 0
  let count = 0
  const base = './frontEnd/img/blog/'
  try {
    let files = await readdir(base)
    files = files.filter(file => !file.startsWith('.'))
    count = files.length
    let allFileStat = await Promise.all(files.map(file => lstat(path.resolve(base, file))))
    total += allFileStat.map(stat => stat.size).reduce((a, b) => a + b, 0)
    return {total, count}
  } catch (e) {
    return e
  }
}

module.exports = {

  getBlogList(req, res) {
    /**
     * 获取指定tag或指定页数的Blog列表
     *
     * */
    let condition = {}
    // condition.isPublic = !req.login
    if (req.query.filter && req.query.filter !== 'all') {
      condition.tag = new req.query.filter
    }
    condition.page = Number(req.query.page) || 1
    condition.limit = Number(req.query.limit) || 10
    getBlogList(condition)
      .then(d => res.send(d))
      .catch(e => e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result || e.toString()))
  },

  getBlog(req, res, next) {
    /**
     * 获取静态的的Blog HTML
     * 这个可以在外面直接使用变量的方式返回回去，但是为了统计阅读数量，就放到这个里面了
     * */
    let pathReg = /^[\u4e00-\u9fa5\w-]+[^ /]$/
    if (pathReg.test(req.params['0'])) {
      let query = {
        escapeName: req.params['0']
      }
      updateBlogProp(query, 'readCount')
        .then(d => {
          if (d.result.value && d.result.value.escapeName === query.escapeName) {
            // vue 重构是用客户端渲染好了
            // res.sendFile('./frontEnd/archives/' + d.result.value.escapeName + '.html', {root: './'})
            res.send(d.result.value)
          } else {
            next()
          }
        })
        .catch(e => e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result || e.toString()))
    } else {
      next()
    }
  },

  getBlogSummary(req, res) {
    getBlogSummary()
      .then(d => res.send(d))
      .catch(e => e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result || e.toString()))
  },

  blogImageUpload: function (req, res) {
    console.log(req.files)
    res.json(req.files.map(file => ({
        originName: file.originalname,
        path: file.path.replace('frontEnd', ''),
        size: file.size
      })))
  },

  blogImageInfo(req, res) {
    getBlogImageInfo()
      .then(d => res.send(d))
      .catch(e => res.status(500).send(e))
  },
}