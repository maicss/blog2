/**
 * Created by maic on 01/03/2017.
 */
const fs = require('fs')
path = require('path')
const promisify = require('util').promisify
const lstat = promisify(fs.lstat)
const readdir = promisify(fs.readdir)
const {getBlogList, updateBlogProp, getBlogSummary} = require('../databaseOperation2')

const getBlogImageInfo = async () => {
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

  getBlogList (req, res) {
    /**
     * 获取指定tag或指定页数的Blog列表
     *
     * */
    let condition = {}
    // condition.isPublic = !req.login
    if (req.query.filter && req.query.filter !== 'all') {
      condition.tag = req.query.filter
    }
    condition.page = Number(req.query.page) || 1
    condition.limit = Number(req.query.limit) || 10
    getBlogList(condition)
      .then(d => res.send(d))
      .catch(e => res.status(500).send(e))
  },

  getBlog (req, res, next) {
    /**
     * 获取静态的的Blog HTML
     * 这个可以在外面直接使用变量的方式返回回去，但是为了统计阅读数量，就放到这个里面了
     * */
    let pathReg = /^[\u4e00-\u9fa5\w-]+[^ /]$/
    if (pathReg.test(req.params['0'])) {
      updateBlogProp(req.params['0'], 'readCount')
        .then(d => {
          if (d.escapeName === req.params['0']) {
            // vue 重构是用客户端渲染好了
            // res.sendFile('./frontEnd/archives/' + d.escapeName + '.html', {root: './'})
            res.send(d)
          } else {
            next()
          }
        })
        .catch(e => res.status(500).send(e))
    } else {
      next()
    }
  },

  getBlogSummary (req, res) {
    getBlogSummary()
      .then(d => res.send(d))
      .catch(e => res.status(500).send(e))
  },

  blogImageUpload: function (req, res) {
    res.json(req.files.map(file => ({
      originName: file.originalname,
      path: file.path.replace('frontEnd', ''),
      size: file.size
    })))
  },

  blogImageInfo (req, res) {
    getBlogImageInfo()
      .then(d => res.send(d))
      .catch(e => res.status(500).send(e))
  },
}