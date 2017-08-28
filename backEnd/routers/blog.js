/**
 * Created by maic on 01/03/2017.
 */
const {getBlogList, updateBlogProp} = require('../databaseOperation')

module.exports = {

  getBlogList (req, res) {
    /**
     * 获取指定tag或指定页数的Blog列表
     *
     * */
    let condition = {}
    condition.isPublic = req.login
    if (req.query.filter && req.query.filter !== 'all') {
      condition.tag = new req.query.filter
    }
    condition.page = Number(req.query.page) || 1
    condition.limit = Number(req.query.limit) || 10
    getBlogList(condition)
      .then(d => res.send(d))
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  },

  getBlog (req, res, next) {
    /**
     * 获取静态的的Blog HTML
     *
     * */
    let pathReg = /^[\u4e00-\u9fa5\w-]+[^ /]$/
    if (pathReg.test(req.params['0'])) {
      let query = {
        escapeName: req.params['0']
      }
      updateBlogProp(query, 'readCount')
        .then(d => {
            if (d.result.value.escapeName === query.escapeName) {
              res.sendFile('./frontEnd/archives/' + d.results[0].escapeName + '.html', {root: './'})
            }
          }
        )
        .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
    } else {
      next()
    }
    // 这个可以在外面直接使用变量的方式返回回去，但是为了统计阅读数量，就放到这个里面了
  },

  blogImageUpload: function (req, res) {
    res.json({path: req.files[0].path.replace('/frontEnd', '')})
  },
}
