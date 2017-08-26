const mongo = require('mongodb')
const url = require('../env').mongoConfig.url
const MongoClient = mongo.MongoClient
const {buildDatabaseRes} = require('./utils')

const findDocuments = async function (collectionName, queryCondition = {}, options = {}) {
  options.limit = options.limit || 1
  options.skip = options.skip || 0
  try {
    const database = await MongoClient.connect(url)
    const collection = database.collection(collectionName)
    try {
      const docs = await collection.find(queryCondition, {'_id': 0}).sort(options.sort).skip(options.skip).limit(options.limit).toArray()
      database.close()
      return buildDatabaseRes(docs)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

/**
 * 更新数据库的方法，只支持单个数据的更新
 * @param collectionName {String}
 * @param queryCondition {Object}
 * @param newData {Object}
 * @param options {Object} []
 * */
const updateDocument = async function (collectionName, queryCondition, newData, options = {}) {
  options.upsert = options.upsert || true
  try {
    const database = await MongoClient.connect(url)
    const collection = database.collection(collectionName)
    try {
      const docs = await collection.findOneAndUpdate(queryCondition, {$set: newData}, options)
      database.close()
      return buildDatabaseRes(docs)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

const deleteDocument = async function (collectionName, queryCondition, options = {}) {
  try {
    const database = await MongoClient.connect(url)
    const collection = database.collection(collectionName)
    try {
      const docs = await collection.findOneAndDelete(queryCondition, options)
      database.close()
      return buildDatabaseRes(docs)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

const insertDocument = async function (collectionName, data) {
  try {
    const database = await MongoClient.connect(url)
    const collection = database.collection(collectionName)
    try {
      const docs = await collection.insertOne(data)
      database.close()
      return buildDatabaseRes(docs.result)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

const buildMomentsSummary = async function () {
  const summary = { all: 0 }
  try {
    const database = await MongoClient.connect(url)
    const momentsCollection = database.collection('moments')
    const momentsSummaryCollection = database.collection('momentsSummary')
    try {
      const allMoments = await momentsCollection.find({}).toArray()
      summary.all = allMoments.length
      allMoments.forEach(item => {
        let year = item.dateStr.substring(0, 4)
        if (summary[year]) {
          summary[year]++
        } else {
          summary[year] = 1
        }
      })
      const docs = await momentsSummaryCollection.findOneAndReplace({ name: 'summary' }, { name: 'summary', content: summary }, { returnOriginal: false })
      database.close()
      return buildDatabaseRes(docs.value.content)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

const buildBlogSummary = async function () {}

module.exports = {

  getMomentsList: async function (condition) {
    let queryObj = {}
    let options = {
      sort: {
        'date': -1
      },
      limit: condition.limit,
      skip: (condition.page - 1) * condition.limit
    }
    for (let a in condition) {
      switch (a) {
        case 'isPublic':
          queryObj = condition.isPublic ? Object.assign(queryObj, {
            isPublic: true
          }) : queryObj
          break
        case 'dateStr':
          queryObj.dateStr = condition.dateStr
          break
        case 'date':
          queryObj.date = condition.date
          break
      }
    }
    return await findDocuments('moments', queryObj, options)
  },

  saveOneMoments: async function (data) {

    const res = await insertDocument('moments', data)
    return buildMomentsSummary()
      .then(() => res)
      .catch(e => buildDatabaseRes(e, 'error', 'save one moments - build summary error.'))
  },

  deleteMoments: async function (data) {
    const res = await deleteDocument('moments', data)
    return buildMomentsSummary()
      .then(() => res)
      .catch(e => buildDatabaseRes(e, 'error', 'save one moments - build summary error.'))
  },

  getMomentsSummary: async function () {
    return await findDocuments('momentsSummary')
  },

  getUser: async function (userInfo) {
    /**
     * @param userInfo {Object}
     * @param userInfo.username
     * @param userInfo.createTime
     * @return {Promise}
     * */
    return await findDocuments('user', userInfo)
  },

  savePostsSha: function (data) {
    updateDocument('postssha', {
      originalFileName: data.originalFileName
    }, data, function (d) {
      if (d.opResStr === 'success') {
        logger.info('update/insert post[%s] sha success.', data.originalFileName)
      } else {
        logger.error('update/insert post[%s] sha failed.', data.originalFileName)
      }
    }, {
      upsert: true
    })
  },
  getPostsSha: function (callback) {
    findDocuments('postssha', {}, {}, callback)
  },

  savePostInfo: function (data, callback) {
    insertDocuments('posts', [data], callback)

  },

  updatePostInfo: function (data, callback) {
    updateDocument('posts', {
      originalFileName: data.originalFileName
    }, data, callback)
  },

  getPosts: function (post, callback) {
    findDocuments('posts', post, {}, callback)
  },

  getAbstracts: function (condition, callback) {
    let query = {}
    if (condition.tag !== 'all') {
      query.tags = condition.tag
    }
    findDocuments('posts', query, {
      limit: condition.limit,
      sort: {
        createDate: -1
      }
    }, callback)
  },

  saveTags: function (info) {
    info.tags.forEach(tag => {
      let data = {
        name: tag,
        posts: [info.post]
      }
      findDocuments('tags', {
        name: tag
      }, {}, function (d) {
        if (d.opResStr === 'success') {
          if (d.results.length) {
            data.posts = d.results[0].posts
          }
          if (data.posts.indexOf(info.post) === -1) {
            data.posts.push(info.post)
          }
          updateDocument('tags', {
            name: tag
          }, data, function (doc) {
            if (doc.opResStr === 'success') {
              logger.info('save tag [%s] success', tag)
            } else {
              logger.error('save tag [%s] failed', tag, (doc.error || doc.fault))
            }
          }, {
            upsert: true
          })
        } else {
          logger.error('save tags module, findDocuments failed', (d.error || d.fault))
        }
      })
    })
  },

  getPostsByTag: function (tag, callback) {
    let query
    if (tag === 'all') {
      query = {}
    } else {
      query = {
        name: tag
      }
    }
    findDocuments('tags', query, {}, callback)
  }
}

// updateDocument('moments', {date: 1503489236608}, {content: 'update test'}).then(d => console.log(d)).catch(e => console.error(e))
// deleteDocument('moments', {date: 1503489236608}).then(d => console.log(d)).catch(e => console.error(e))
// insertDocument('moments', {
//   date: 1503489246608,
//   dateStr: '2017-08-23 19:53:56',
//   weather: {},
//   content: 'insert test2',
//   images: [],
//   isPublic: true
// }).then(d => console.log(d)).catch(e => console.error(e))
// findDocuments('momentsSummary').then(d => console.log(d)).catch(e => console.error(e))
// buildMomentsSummary().then(d => console.log(d)).catch(e => console.error(e))
// console.log(new mongo.Logger().error('aa'))