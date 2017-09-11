const mongo = require('mongodb')
const url = require('../env').mongoConfig.url
const MongoClient = mongo.MongoClient
const {buildDatabaseRes, logger} = require('./utils')

const findDocuments = async function (collectionName, queryCondition = {}, options = {}) {
  options.limit = options.limit || 0
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

const updateDocument = async function (collectionName, queryCondition, newData, options = {}) {
  /**
   * 更新数据库的方法，只支持单个数据的更新
   * @param collectionName {String}
   * @param queryCondition {Object}
   * @param newData {Object}
   * @param options {Object} []
   * */
  options.upsert = options.upsert || true
  options.returnOriginal = false
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
  const summary = {all: 0}
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
      const docs = await momentsSummaryCollection.findOneAndReplace({name: 'summary'}, {
        name: 'summary',
        content: summary
      }, {returnOriginal: false, upsert: true})
      database.close()
      return buildDatabaseRes(docs.value.content)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

const buildBlogSummary = async () => {
  const summary = {all: 0}
  try {
    const database = await MongoClient.connect(url)
    const blogCollection = database.collection('blog')
    const blogSummaryCollection = database.collection('blogSummary')
    try {
      const allBlog = await blogCollection.find({}).toArray()
      summary.all = allBlog.length
      allBlog.forEach(blog => {
        blog.tags.forEach(tag => {
          summary[tag] ? summary[tag] ++ : summary[tag] = 1
        })
      })
      const docs = await blogSummaryCollection.findOneAndReplace({name: 'summary'}, {
        name: 'summary',
        content: summary
      }, {returnOriginal: false, upsert: true})
      database.close()
      return buildDatabaseRes(docs.value.content)
    } catch (e) {
      return buildDatabaseRes(e, 'error', 'find documents failed.')
    }

  } catch (e) {
    return buildDatabaseRes(e, 'fault', 'connect database error.')
  }
}

module.exports = {

  // user
  getUser: async function (userInfo) {
    /**
     * @param userInfo {Object}
     * @param userInfo.username
     * @param userInfo.createTime
     * @return {Promise}
     * */
    return await findDocuments('user', userInfo)
  },

  // moments
  getMomentsList: async function (condition) {
    let queryObj = {}
    let options = {
      sort: {
        'date': -1
      },
      limit: condition.limit,
      skip: (condition.page - 1) * condition.limit
    }
    if (condition.isPublic) {
      queryObj.isPublic = true
    } else if (condition.date) {
      queryObj.date = condition.date
    }
    return await findDocuments('moments', queryObj, options)
  },

  saveMoments: async function (data) {

    const res = await insertDocument('moments', data)
    return await buildMomentsSummary()
      .then(() => res)
      .catch(e => buildDatabaseRes(e, 'error', 'save moments - build summary error.'))
  },

  updateMoments: async (moments) => {
    try {
      console.log(moments)
      const res = await updateDocument('moments', {date: moments.date}, {content: moments.content})
      await buildMomentsSummary()
      console.log(res)
      return res
      // .then(() => res)
      // .catch(e => buildDatabaseRes(e, 'error', 'update moments - build summary error.'))
    } catch (e) {
      console.error('updateMoments in db error: ', e)
    }
  },

  deleteMoments: async function (data) {
    const res = await deleteDocument('moments', data)
    return await buildMomentsSummary()
      .then(() => res)
      .catch(e => buildDatabaseRes(e, 'error', 'delete moments - build summary error.'))
  },

  getMomentsSummary: async function () {
    return await findDocuments('momentsSummary')
  },

// Blog
  getBlogList: async function (condition) {
    let queryObj = {}
    let options = {
      sort: {createDate: -1},
      limit: condition.limit,
      skip: (condition.page - 1) * condition.limit
    }
    // if (condition.isPublic) {
      // queryObj.isPublic = true
    // } else
    if (condition.tag) {
      queryObj.tags = condition.tag
    }
    console.log(queryObj, options)
    return await findDocuments('blog', queryObj, options)
  },

  getBlogSummary: async () => {
    return await findDocuments('blogSummary')
  },

  saveBlogHash: async function (data) {
    return await updateDocument('blogHash', {originalFileName: data.originalFileName}, data)
  },

  getBlogHash: async function () {
    return await findDocuments('blogHash')
  },

  saveBlog: async function (data) {
    const res = await updateDocument('blog',{escapeName: data.escapeName}, data)
    return buildBlogSummary().then(() => res)
      .catch(e => buildDatabaseRes(e, 'error', 'save blog - build summary error.'))
  },

  updateBlogProp: async function (escapeName, attr) {
    /**
     * 内容的Update使用重新渲染来做，因为可能更新了摘要和内容，还要重新生成静态文件
     * 其余的Update有两个，一个readCount，一个commentCount
     * 这两个更新不用先查出来赋一个值再插入，直接使用mongodb自带的$inc就可以了
     * */

    if (attr !== 'readCount' && attr !== 'commentCount') {
      logger.error('invalid attr value')
      throw Error('invalid attr value')
    }

    try {
      const database = await MongoClient.connect(url)
      const collection = database.collection('blog')
      try {
        const docs = await collection.findOneAndUpdate(escapeName, {$inc: { [attr] : 1}}, {returnOriginal: false, _id: 0})
        database.close()
        return buildDatabaseRes(docs)
      } catch (e) {
        return buildDatabaseRes(e, 'error', 'find documents failed.')
      }

    } catch (e) {
      return buildDatabaseRes(e, 'fault', 'connect database error.')
    }
  }

}


// aa  = async function (escapeName, attr) {
//   /**
//    * 内容的Update使用重新渲染来做，因为可能更新了摘要和内容，还要重新生成静态文件
//    * 其余的Update有两个，一个readCount，一个commentCount
//    * 这两个更新不用先查出来赋一个值再插入，直接使用mongodb自带的$inc就可以了
//    * */

//   if (attr !== 'readCount' && attr !== 'commentCount') {
//     logger.error('invalid attr value')
//     throw Error('invalid attr value')
//   }

//   try {
//     const database = await MongoClient.connect(url)
//     const collection = database.collection('blog')
//     try {
//       const docs = await collection.findOneAndUpdate(escapeName, {$inc: { [attr] : 1}}, {returnOriginal: false, _id: 0})
//       database.close()
//       return buildDatabaseRes(docs)
//     } catch (e) {
//       return buildDatabaseRes(e, 'error', 'find documents failed.')
//     }

//   } catch (e) {
//     return buildDatabaseRes(e, 'fault', 'connect database error.')
//   }
// }
// aa({escapeName: 'code-snippet'}, 'readCount').then(d=> console.log(d)).catch(e => console.log(e))
// findDocuments('blog', {isPublic: true}, { skip: 0, limit: 10}).then(d=> console.log(d)).catch(e => console.log(e))
// aa({}).then(d=> console.log(d)).catch(e => console.log(e))