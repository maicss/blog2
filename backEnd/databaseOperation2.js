const url = require('../env').mongoConfig.url
const mongoose = require('mongoose')
const moment = require('moment')

const {momentsModel, blogHashModel, blogModel, blogSummaryModel, indexImageModel, momentsSummaryModel, userModel} = require('./databaseModel')
mongoose.Promise = global.Promise
mongoose.connect(url, {useMongoClient: true})

/*======================     user     ======================*/
const getUser = async (condition) => {
  /**
   * @param condition {createTime|username}
   * */
  try {
    if (condition.createTime && condition.username) {
      const res = await userModel.find(condition, {'_id': 0})
      if (res.length) {
        return res
      } else {
        return new Error('Cannot find user.')
      }
    } else {
      return new Error('Invalid user query condition')
    }
  } catch (e) {
    return e
  }
}

/*======================    moments    ======================*/
const getMomentsList = async (condition) => {
  /**
   * 根据限制条件获得一组说说
   * @param {Object} condition
   * @param {Number} condition.limit - items count
   * @param {Number} condition.page - page base on limit
   * @param {Boolean} condition.isPublic - moments private of false
   * */
  try {
    if (condition.limit && condition.page) {
      let skip = (condition.page - 1) * condition.limit
      const isPublic = condition.isPublic || true
      return await momentsModel.find({isPublic}, {_id: 0}).sort({date: -1}).skip(skip).limit(condition.limit)
    } else {
      return new Error('Invalid moments query condition')
    }
  } catch (e) {
    return e
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
  try {
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
  catch (e) {
    return e
  }
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
  try {
    const _moments = new momentsModel(moments)
    let res = await _moments.save()
    await buildMomentsSummary()
    return res
  }
  catch (e) {
    return e
  }
}

const updateMoments = async (moments) => {
  /**
   * 更新一个说说的内容【现阶段只允许更新文字内容】
   * @param {Object} moments 可以只传content和date两个属性
   * @param {String} moments.content
   * @param {Number} moments.date
   * @return {Object} moments 数据库中完整的moments
   * */
  try {
    return await momentsModel.findOneAndUpdate({date: moments.date}, {content: moments.content}, {new: true})
  } catch (e) {
    return e
  }
}

const deleteMoments = async (date) => {
  /**
   * 删除一条说说
   * @param {Number} date - date of one moments
   * @return {Boolean} true - delete success
   * */
  try {
    let res = await momentsModel.deleteOne({date})
    if (res.result.n === 1) {
      return true
    } else {
      return new Error('Bad delete arguments.')
    }
  } catch (e) {
    return e
  }

}

const getMomentsSummary = async () => {
  /**
   * 获取说说总结
   * @return {Object} content
   * @return {Number} content.all
   * @return {Number} [content[someYear]]
   * */
  try {
    return momentsSummaryModel.find({}, '-_id content')
  } catch (e) {
    return e
  }
}

/*======================       blog      ======================*/

const getBlogList = async (condition) => {
  /**
   * 获取博客的列表
   * @param {Object} condition
   * @param {Number} condition.limit
   * @param {Number} condition.page
   * @param {Boolean} condition.isPublic
   * @return {array} blog list
   * */
  try {
    if (condition.limit && condition.page) {
      const isPublic = condition.isPublic || true
      const skip = (condition.page - 1) * condition.limit
      return await blogModel.find({isPublic}).sort({date: -1}).skip(skip).limit(condition.limit)
    } else {
      return new Error('Invalid blog query condition')
    }
  } catch (e) {
    return e
  }

}

/*======================    indexImage    ======================*/

// export

module.exports = {
  getUser,
  getMomentsList,
  saveMoments,
  updateMoments,
  deleteMoments,
  getBlogList,


}

// getBlogList({limit:10, page: 1}).then(d => console.log(d)).catch(e => console.error(e))

