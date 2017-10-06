const url = require('../../env').mongoConfig.url
const mongoose = require('mongoose')

const {
  momentsModel, momentsSummaryModel,
  blogHashModel, blogModel, blogSummaryModel,
  indexImageModel,
  userModel
} = require('./databaseModel')
mongoose.Promise = global.Promise
mongoose.connect(url, {useMongoClient: true})
const {logger} = require('../utils')

/*======================     user     ======================*/
/**
 * @param {Object} condition
 * @param {Number} condition[].createTime
 * @param {String} condition[].username
 * @return {Object} user
 * */
const getUser = async (condition) => {
  if (condition.createTime || condition.username) {
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

/**
 * 根据限制条件获得一组说说
 * @param {Object} condition
 * @param {Number} condition.limit[] - items count
 * @param {Number} condition.page[] - page base on limit
 * @param {Boolean} condition.isPublic=true[] - moments private of false
 * @param {Number} condition.date[] - 查询某个说说
 * */
const getMomentsList = async (condition) => {
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

/**
 * 更新说说个数的函数
 * @return {Object} content
 * @return {Number} content.all
 * @return {Number} content[some year]
 * */
const buildMomentsSummary = async () => {
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
const saveMoments = async (moments) => {
  const _moments = new momentsModel(moments)
  let res = await _moments.save()
  await buildMomentsSummary()
  return res

}

/**
 * 更新一个说说的内容【现阶段只允许更新文字内容】
 * @param {Object} moments 可以只传content和date两个属性
 * @param {String} moments.content
 * @param {Number} moments.date
 * @return {Object} moments 数据库中完整的moments
 * */
const updateMoments = async (moments) => {
  return await momentsModel.findOneAndUpdate({date: moments.date}, {content: moments.content}, {new: true})
}

/**
 * 删除一条说说
 * @param {Number} date - date of one moments
 * @return {Boolean} true - delete success
 * */
const deleteMoments = async (date) => {
  if (typeof date === 'number') {
    let res = await momentsModel.deleteOne({date})
    await buildMomentsSummary()
    if (res.result.n === 1) {
      return true
    } else {
      throw new Error('Invalid delete argument.')
    }
  } else {
    throw new TypeError('Delete moments argument not Number type.')
  }

}

/**
 * 获取说说总结
 * @return {Object} content
 * @return {Number} content.all
 * @return {Number} [content[someYear]]
 * */
const getMomentsSummary = async () => {
  let res = await momentsSummaryModel.find({}, '-_id content')
  return res[0]
}

/*======================       blog      ======================*/

/**
 * 创建blog summary
 * @return {Object} summary
 * @return {String} summary.name=summary
 * @return {Object} summary.content
 * */
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

/**
 * 获取博客的列表
 * @param {Object} condition
 * @param {Number} condition.limit
 * @param {Number} condition.page
 * @param {Boolean} condition.isPublic=true
 * @param {String} [condition.tag]
 * @return {array} blog list
 * */
const getBlogList = async (condition) => {
  if (condition.limit && condition.page) {
    const skip = (condition.page - 1) * condition.limit
    const query = {}
    if (condition.tag) query.tags = condition.tag
    // 还没想好私有的是什么样的，就没添加isPublic这个key
    if (condition.isPublic) query.isPublic = condition.isPublic
    return await blogModel.find(query, '-_id').sort({date: -1}).skip(skip).limit(condition.limit)
  } else {
    throw new Error('Invalid blog query condition')
  }

}

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
const saveBlog = async (blog) => {

  const res = await new blogModel(blog).save()
  await buildBlogSummary()
  return res
}

/**
 * 保存MD文件的hash值
 * @param {Object} data
 * @param {String} data.hash
 * @param {String} data.originalFileName
 * @param {String} data.escapeName
 * @return {Object} data saved
 * */
const saveBlogHash = async (data) => {

  if (data.hash && data.escapeName && data.originalFileName) {
    return await new blogHashModel(data).save()
  } else {
    throw new Error('Invalid hash data to save.')
  }

}

/**
 * 获得所有blog的hash值
 * @return {Array} list of blog hash
 * */
const getBlogHash = async () => {
  return await blogHashModel.find({}, '-_id -__v')
}

/**
 * 获得blog summary
 * @return {Object} content
 * @return {Number} content.all
 * @return {Number} content[someTag]
 * */
const getBlogSummary = async () => {
  let res = await blogSummaryModel.find({}, '-_id content')
  return res[0]
}

/**
 * 更新blog的commentCount和readCount
 * @param {string} escapeName - blog的名称
 * @param {String} attr - ['readCount', 'commentCount']想要更新的值
 * */
const updateBlogProp = async (escapeName, attr) => {
  if (escapeName && (attr === 'commentCount' || attr === 'readCount')) {
    return await blogModel.findOneAndUpdate({escapeName}, {$inc: {[attr]: 1}})
  } else {
    throw new Error('Invalid update blog prop arguments')
  }
}

/*======================    indexImage    ======================*/

/**
 * 保存图片信息
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
const saveIndexImage = async (imageInfo) => {
  try {
    const model = new indexImageModel(imageInfo)
    await model.save()
    return 'saved'
  } catch (e) {
    // ignore duplicate key error
    if (e.code === 'E11000' || e.code === 11000) {
      return 'duplicate key'
    } else {
      throw e
    }
  }
}

/**
 * 找一个图片
 * @param {String} type ['like', 'temp', undefined] - 如果为空，则认为是'like'+'temp'，因为还有一个dislike
 * @return {Object} indexImage instance
 * */
const getIndexImage = async (type) => {
  if (!type) {
    return await indexImageModel.find({'type': {$ne: 'dislike'}}, '-_id -__v')
  } else if (type === 'like' || type === 'temp') {
    return await indexImageModel.find({type}, '-_id -__v')
  } else {
    throw new Error('Invalid get index image argument')
  }
}

/**
 * 删除index image 信息
 * @param {Number} id - 图片id的
 * @return {Promise}
 * */
const deleteIndexImage = async (id) => {
  if (typeof  id === 'number') {
    return await indexImageModel.deleteOne({id})
  } else {
    throw new TypeError('Invalid delete index image argument')
  }
}

/**
 * 更新首页背景图片信息，目前只有两个操作，一个是喜欢，一个是不喜欢，都是修改图片的type
 * @param {Number} id - id of image
 * @param {String} action ['like', 'dislike']
 * @return {Boolean} action result
 * */
const updateIndexImage = async (id, action) => {
  if (typeof id === 'number' && (action === 'like' || action === 'dislike')) {
    return await indexImageModel.findOneAndUpdate({id}, {type: action}, {new: true})
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
  deleteIndexImage,
}

// indexImageModel.find({type: 'liked'}).then(d => console.log(d)).catch(e => console.error(e))
// indexImageModel.find({type: 'liked'}).then(d => console.log(d)).catch(e => console.error(e))
// indexImageModel.updateMany({type: 'liked'}, {type: 'like'}).then(d => {
//   console.log(d)
// }).catch(e => console.error(e))
// momentsModel.find({ isPublic: true, date: 1505960032010 }, '-_id').sort({date: -1}).skip(undefined).limit(undefined).then(d => console.log(d)).catch(e => console.error(e))