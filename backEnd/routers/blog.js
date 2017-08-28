/**
 * Created by maic on 01/03/2017.
 */
const {getBlogList, updatePost, getAbstracts, getPostByTag} = require('../databaseOperation')

module.exports = {
  post: function (req, res, next) {
    // 做个缓存试试
    // let cachedRes = new Set();
    let pathReg = /^[\u4e00-\u9fa5\w-]+[^ /]$/
    if (pathReg.test(req.params['0'])) {
      // let hasCached = false;
      // for (let post of cachedRes) {
      //     if (post.escapeName === req.params['0']) {
      //         hasCached = true;
      //         break;
      //     }
      // }
      // if (hasCached) {
      //     res.sendFile('./frontEnd/archives/' + d.results[0].escapeName + '.html', {root: './'});
      // } else {
      let query = {
        escapeName: req.params['0']
      }
      getPost(query, function (d) {
        if (d.opResStr === 'success' && d.results.length) {
          let data = d.results[0]
          data.readCount++
          updatePost(data, function (d) {
          })
          // cachedRes.add(data);
          res.sendFile('./frontEnd/archives/' + d.results[0].escapeName + '.html', {root: './'})
        } else {
          next()
        }
      })

      // }

    } else {
      next()
    }
  },

  getBlogList (req, res) {
    // todo readCount add commentCount
    let condition = {}
    condition.isPublic = req.login
    if (req.query.filter && req.query.filter !== 'all') {
      condition.dateStr = new RegExp('^' + req.query.filter)
    }
    condition.page = Number(req.query.page)
    condition.limit = Number(req.query.limit)
    getBlogList(condition)
      .then(d => res.sendFile('./frontEnd/archives/' + d.result[0].escapeName + '.html', {root: './'}))
      .catch(e => {e.status === 'error' ? res.status(400).send(e.result) : res.status(500).send(e.result)})
  },
  abstracts: function (req, res, next) {
    let query = {
      limit: 10,
      tag: req.body.tag
    }
    getAbstracts(query, function (d) {
      if (d.opResStr === 'success') {
        res.json(d.results)
      } else {
        res.status(500).send(d)
      }
    })

  },

  blogImageUpload: function (req, res, next) {
    res.json({path: req.files[0].path.replace('/frontEnd', '')})
  },

  allTags: function (req, res, next) {
    getPostByTag('all', function (d) {
      if (d.opResStr === 'success') {
        res.json(d.results)
      } else {
        res.status(500).send(d.error || d.fault)
      }
    })
  },
  singleTag: function (req, res, next) {
    getPostByTag(req.body.tag, function (d) {
      if (d.opResStr === 'success') {
        res.json(d.results)
      } else {
        res.status(500).send(d.error || d.fault)
      }
    })
  }
}
