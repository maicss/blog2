const url = require('../env').mongoConfig.url
const mongoose = require('mongoose')

const {momentsModel, blogHashModel, blogModel, blogSummaryModel, indexImageModel, momentsSummaryModel, userModel} = require('./databaseModel')
mongoose.Promise = global.Promise
mongoose.connect(url, {useMongoClient: true})


// user
const getUser = async (condition) => {
  /**
   * @param condition {createTime|username}
   * */
  try {
    if (!condition.createTime && !condition.username) {
      return new Error('Invalid user query condition')
    }
    const res = await userModel.find(condition, {'_id': 0})
    if (res.length) {
      return res
    } else {
      return new Error('Cannot find user.')
    }
  } catch (e) {
    return e
  }
}

// moments
const getMomentsList = async (condition) => {
  /**
   * @param {Object} condition
   * @param {Number} condition.limit - items count
   * @param {Number} condition.page - page base on limit
   * @param {Boolean} condition.isPublic - moments private of false
   * */
  try {
    if (!condition.limit && !condition.page) {
      return new Error('Invalid moments query condition')
    }
    const query = {
      sort: {date: -1},
      limit: condition.limit,
      skip: (condition.page - 1) * condition.limit
    }
    if (condition.isPublic) {
      query.isPublic = true
    }
    return await momentsModel.find(query, {_id: 0})
  } catch (e) {
    return e
  }
}

// blog

// indexImage


// export

module.exports = {
  getUser,
  getMomentsList,
}

getMomentsList({limit: 10, page: 1}).then(d => console.log(d)).catch(e => console.error(e))