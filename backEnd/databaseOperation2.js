const url = require('../env').mongoConfig.url
const mongoose = require('mongoose')

const {
  momentsModel, momentsSummaryModel,
  blogHashModel, blogModel, blogSummaryModel,
  indexImageModel,
  userModel
} = require('./databaseModel')
mongoose.Promise = global.Promise
mongoose.connect(url, {useMongoClient: true})
const {logger} = require('./utils')

/*======================     user     ======================*/
const getUser = async (condition) => {
  /**
   * @param {createTime|username} condition
   * */
  if (!condition.createTime || !condition.username) {
    const res = await userModel.find(condition, {'_id': 0})
    if (res.length) {
      return res
    } else {
      throw new Error('Cannot find user.')
    }
  } else {
    throw new Error('Invalid user query condition')
  }
}

/*======================    moments    ======================*/
const getMomentsList = async (condition) => {
  /**
   * 根据限制条件获得一组说说
   * @param {Object} condition
   * @param {Number} condition.limit - items count
   * @param {Number} condition.page - page base on limit
   * @param {Boolean} condition.isPublic=true - moments private of false
   * @param {Number} condition.date - 查询某个说说
   * */
  if (condition.limit && condition.page || condition.date) {
    let skip = (condition.page - 1) * condition.limit
    const query = {}
    query.isPublic = condition.isPublic || true
    if (condition.date) {query.date = condition.date}
    if (condition.dateStr) {query.dateStr = condition.dateStr}
    return await momentsModel.find(query, '-_id -__v').sort({date: -1}).skip(skip).limit(condition.limit)
  } else {
    throw new Error('Invalid moments query condition')
  }
}

const buildMomentsSummary = async () => {
  /**
   * 更新说说个数的函数
   * @return {Object} content
   * @return {Number} content.all
   * @return {Number} content[some year]
   * */
  const summary = {all: 0}
  const allMoments = await momentsModel.find({})
  summary.all = allMoments.length
  allMoments.forEach(item => {
    let year = item.dateStr.substring(0, 4)
    if (summary[year]) {
      summary[year]++
    } else {
      summary[year] = 1
    }
  })
  return await momentsSummaryModel.findOneAndUpdate({name: 'summary'}, {
    name: 'summary',
    content: summary
  }, {new: true, upsert: true})
}

const saveMoments = async (moments) => {
  /**
   * 插入说说，并更新说说总结
   * @param {Object} moments one moments
   * @param {Object} moments.weather - the weather of moments create day
   * @param {String} moments.weather.day
   * @param {String} moments.content - moments content
   * @param {Number} moments.date - moments create date millisecond
   * @param {String} moments.dateStr - moments create date string
   * @param {Array} moments.images - moments images
   * @param {Boolean} moments.isPublic - moments privilege
   * @return {Object} this moments in database
   * */
  const _moments = new momentsModel(moments)
  let res = await _moments.save()
  await buildMomentsSummary()
  return res

}

const updateMoments = async (moments) => {
  /**
   * 更新一个说说的内容【现阶段只允许更新文字内容】
   * @param {Object} moments 可以只传content和date两个属性
   * @param {String} moments.content
   * @param {Number} moments.date
   * @return {Object} moments 数据库中完整的moments
   * */
  return await momentsModel.findOneAndUpdate({date: moments.date}, {content: moments.content}, {new: true})
}

const deleteMoments = async (date) => {
  /**
   * 删除一条说说
   * @param {Number} date - date of one moments
   * @return {Boolean} true - delete success
   * */
  if (typeof date === 'number') {
    let res = await momentsModel.deleteOne({date})
    if (res.result.n === 1) {
      return true
    } else {
      throw new Error('Invalid delete argument.')
    }
  } else {
    throw new TypeError('Delete moments argument not Number type.')
  }

}

const getMomentsSummary = async () => {
  /**
   * 获取说说总结
   * @return {Object} content
   * @return {Number} content.all
   * @return {Number} [content[someYear]]
   * */
  let res = await momentsSummaryModel.find({}, '-_id content')
  return res[0]
}

/*======================       blog      ======================*/

const buildBlogSummary = async () => {
  const summary = {all: 0}
  const allBlogs = await blogModel.find({})
  summary.all = allBlogs.length
  allBlogs.forEach(blog => {
    blog.tags.forEach(tag => {
      summary[tag] ? summary[tag]++ : summary[tag] = 1
    })
  })
  return await blogSummaryModel.findOneAndUpdate({name: 'summary'}, {
    name: 'summary',
    content: summary
  }, {new: true, upsert: true})
}

const getBlogList = async (condition) => {
  /**
   * 获取博客的列表
   * @param {Object} condition
   * @param {Number} condition.limit
   * @param {Number} condition.page
   * @param {Boolean} condition.isPublic=true
   * @param {String} [condition.tag]
   * @return {array} blog list
   * */
  if (condition.limit && condition.page) {
    const skip = (condition.page - 1) * condition.limit
    const query = {}
    if (condition.tag) query.tags = condition.tag
    query.isPublic = condition.isPublic || true
    return await blogModel.find(query, '-_id').sort({date: -1}).skip(skip).limit(condition.limit)
  } else {
    throw new Error('Invalid blog query condition')
  }

}

const saveBlog = async (blog) => {
  /**
   * 保存博客，并更新summary
   * @param {Object} blog
   * @param {String} blog.escapeName
   * @param {String} blog.originalFileName
   * @param {String} blog.date
   * @param {String} blog.html
   * @param {String} blog.abstract
   * @param {String} blog.title
   * @param {String} blog.more
   * @param {String} blog.readCount=0
   * @param {String} blog.commentCount=0
   * @param {Array} blog.tags
   * @param {Boolean} blog.isPublic=true
   * @return {Object} blog saved
   * */

  const res = await new blogModel(blog).save()
  await buildBlogSummary()
  return res
}

const saveBlogHash = async (data) => {
  /**
   * 保存MD文件的hash值
   * @param {Object} data
   * @param {String} data.hash
   * @param {String} data.originalFileName
   * @param {String} data.escapeName
   * @return {Object} data saved
   * */

  if (data.hash && data.escapeName && data.originalFileName) {
    return await new blogHashModel(data).save()
  } else {
    throw new Error('Invalid hash data to save.')
  }

}

const getBlogHash = async () => {
  /**
   * 获得所有blog的hash值
   * @return {Array} list of blog hash
   * */
  return await blogHashModel.find({}, '-_id -__v')
}

const getBlogSummary = async () => {
  /**
   * 获得blog summary
   * @return {Object} content
   * @return {Number} content.all
   * @return {Number} content[someTag]
   * */
  let res = await blogSummaryModel.find({}, '-_id content')
  return res[0]
}

const updateBlogProp = async (escapeName, attr) => {
  /**
   * 更新blog的commentCount和readCount
   * @param {string} escapeName - blog的名称
   * @param {'readCount', 'commentCount'} attr - 想要更新的值
   * */
  if (escapeName && (attr === 'commentCount' || attr === 'readCount')) {
    return await blogModel.findOneAndUpdate({escapeName}, {$inc: {[attr]: 1}})
  } else {
    throw new Error('Invalid update blog prop arguments')
  }
}

/*======================    indexImage    ======================*/

const saveIndexImage = async (imageInfo) => {
  /**
   * 保存图片信息。可以存储重复信息，这样就不用手动diff了
   * @param {Object} imageInfo
   * @param {String} imageInfo.name
   * @param {String} imageInfo.author
   * @param {Number} imageInfo.width
   * @param {Number} imageInfo.height
   * @param {Number} imageInfo.id
   * @param {String} imageInfo.format
   * @param {String} imageInfo.url
   * @return {Object} imageInfo
   * */
  try {
    const model = new indexImageModel(imageInfo)
    await model.save()
    return 'saved'
  } catch (e) {
    // ignore duplicate key error
    if (e.code !== 'E11000' && e.code !== '11000') {
      throw e
    } else {
      return 'duplicate key'
    }
  }
}

const getIndexImage = async (type) => {
  /**
   * 找一个图片
   * @param {'liked', 'temp', ''} type
   * @return {Object} indexImage instance
   * */
  return await indexImageModel.find({type}, '-_id -__v')
}

const updateIndexImage = async (id, action) => {
  /**
   * 更新首页背景图片信息，目前只有两个操作，一个是喜欢 -> 把图片的type修改成liked，一个是删除 -> 删除图片信息
   * @param {Number} id - id of image
   * @param {'like', 'dislike'} action
   * @return {Boolean} action result
   * */
  if (typeof id === 'number' && (action === 'like' || action === 'dislike')) {
    if (action === 'like') {
      return await indexImageModel.findOneAndUpdate({id}, {type: 'liked'}, {new: true})
    } else {
      return await indexImageModel.findOneAndRemove({id})
    }
  } else {
    throw new Error('Invalid update index image action')
  }

}

/*=======================     export      =======================*/

module.exports = {
  getUser,
  getMomentsList,
  saveMoments,
  updateMoments,
  deleteMoments,
  getMomentsSummary,
  getBlogList,
  saveBlogHash,
  getBlogHash,
  saveBlog,
  getBlogSummary,
  updateBlogProp,
  saveIndexImage,
  getIndexImage,
  updateIndexImage,
}

indexImageModel.find(undefined).then(d => console.log(d.length)).catch(e => console.error(e))
// momentsModel.find({ isPublic: true, date: 1505960032010 }, '-_id').sort({date: -1}).skip(undefined).limit(undefined).then(d => console.log(d)).catch(e => console.error(e))