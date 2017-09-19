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

const buildBlogSummary = async () => {
  const summary = {all: 0}
  try {
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
  } catch (e) {
    return e
  }
}

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
      return await blogModel.find({isPublic}, '-_id').sort({date: -1}).skip(skip).limit(condition.limit)
    } else {
      return new Error('Invalid blog query condition')
    }
  } catch (e) {
    return e
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

  try {
    const res = await new blogModel(blog).save()
    await buildBlogSummary()
    return res
  } catch (e) {
    return e
  }
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

  try {
    if (data.hash && data.escapeName && data.originalFileName) {
      return await new blogHashModel(data).save()
    } else {
      return new Error('Invalid hash data to save.')
    }
  } catch (e) {
    return e
  }

}

const getBlogHash = async () => {
  try {
    return await blogHashModel.find({}, '-_id -__v')
  } catch (e) {
    return e
  }
}

const getBlogSummary = async () => {
  /**
   * 获得blog summary
   * @return {Object} content
   * @return {Number} content.all
   * @return {Number} content[someTag]
   * */
  try {
    return blogSummaryModel.find({}, '-_id content')
  } catch (e) {
    return e
  }
}

const updateBlogProp = async (escapeName, attr) => {
  /**
   * 更新blog的commentCount和readCount
   * @param {string} escapeName - blog的名称
   * @param {'readCount', 'commentCount'} attr - 想要更新的值
   * */
  if (escapeName && (attr === 'commentCount' || attr === 'readCount')) {
    return await blogModel.where({escapeName}).update({$inc: {[attr]: 1}})
  } else {
    return new Error('Invalid update blog prop arguments')
  }
}

/*======================    indexImage    ======================*/

const saveIndexImage = async (imageInfo) => {
  /**
   * 保存图片信息。可以存储重复信息，这样就不用手动diff了
   * // todo 存储类型是单个对象还是一个数组
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
    // model.isNew = false
    // todo 第一次不存储
    return await model.save()
  } catch (e) {
    return e
  }
}

const getIndexImage = async (type) => {
  /**
   * 找一个图片
   * @param {'liked', 'temp'} type
   * @return {Object} indexImage instance
   * */
  try {
    if (type === 'liked' || type === 'temp') {
      return await indexImageModel.find({type}, '-_id -__v')
    } else {
      return new Error('Invalid get index image type.')
    }
  } catch (e) {
    return e
  }
}

const updateIndexImage = async (id, action) => {
  /**
   * 更新首页背景图片信息，目前只有两个操作，一个是喜欢 -> 把图片的type修改成liked，一个是删除 -> 删除图片信息
   * @param {Number} id - id of image
   * @param {'like', 'dislike'} action
   * @return {Boolean} action result
   * */

  try {
    if (typeof id === 'number' && (action === 'like' || action === 'dislike')) {
      if (action === 'like') {
        return await indexImageModel.findOneAndUpdate({id}, {})
      } else {
        // todo
        return await indexImageModel.findOneAndRemove({id})
      }
    } else {
      return new Error('Invalid update index image action')
    }
  } catch (e) {
    return e
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

}

const hash = {
  hash: '123',
  originalFileName: 'kkk',
  escapeName: 'kkk'
}

const images = [
  {
    name: '鸣沙山月牙泉',
    author: 'vcg-woho',
    width: 2048,
    height: 1098,
    id: 227834517,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227834517/m%3D2048/v2?user_id=20263175&webp=true&sig=1a3c7494358f74731e3c761c057658e290942a1594426ac921c1a0bbe8161ca2',
    type: 'temp'
  },
  {
    name: 'tigre, drawing, B&W',
    author: 'javi_heavypirulo',
    width: 3513,
    height: 2133,
    id: 227921341,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227921341/m%3D2048/v2?user_id=20263175&webp=true&sig=96bb994e372cc7400cdde674fe40776f3a8ef452c21d4c411cb3513e59301ce7',
    type: 'temp'
  },
  {
    name: 'A road in the middle of the forest',
    author: 'willianjusten',
    width: 3992,
    height: 2992,
    id: 227840003,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227840003/m%3D2048/v2?user_id=20263175&webp=true&sig=bda92dc46e5aa9b6ddf56a9af58b0a939ae41685ea486418499887512d21fbe4',
    type: 'temp'
  },
  {
    name: '日落',
    author: 'vcg-AUA557',
    width: 2048,
    height: 1154,
    id: 227876041,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227876041/m%3D2048/v2?user_id=20263175&webp=true&sig=6327f4d22ee217eee55dd00a7311426c6ec83dbca4718422feed0d8a509866e1',
    type: 'temp'
  },
  {
    name: 'Preparation to Ukraine Independence Day parade in Kyiv',
    author: 'vitaliyholovin',
    width: 4000,
    height: 2667,
    id: 169178869,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/169178869/m%3D2048/v2?user_id=20263175&webp=true&sig=277ceaf76b519092b29085a6bb5c06bcf0e41883cad29a51edcbb50f46511ca0',
    type: 'temp'
  },
  {
    name: 'pastel ',
    author: 'vertumnhelga',
    width: 2751,
    height: 2661,
    id: 173058,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/173058/m%3D2048/v2?user_id=20263175&webp=true&sig=a939fdf77b59e729fdcffe434d5f1ea7a83bd1849c6af2b1d7764af80ac37c4f',
    type: 'temp'
  },
  {
    name: 'Barcelona',
    author: 'artur_aka_anis',
    width: 3608,
    height: 3150,
    id: 143876893,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/143876893/m%3D2048/v2?user_id=20263175&webp=true&sig=049dae685ff7d569345bdb641f8c1b86cfc27a35a1e91ae3ed25c94f182674ca',
    type: 'temp'
  },
  {
    name: 'Na Pali Coast',
    author: 'carl22',
    width: 2000,
    height: 1335,
    id: 96135409,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/96135409/m%3D2048/v2?user_id=20263175&webp=true&sig=2411ff2967dbc0ac49f1d7e547d7e8f9f89e82790e5eca0a11a786823acb6f48',
    type: 'temp'
  },
  {
    name: 'ds',
    author: 'sypalovasofiya',
    width: 1680,
    height: 945,
    id: 227733747,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227733747/m%3D2048/v2?user_id=20263175&webp=true&sig=1e2e61937c7c5221adf274c4152e727106e059ebbcff1f2782775fa641ce6c5d',
    type: 'temp'
  },
  {
    name: 'Kiribati - Impact of overfishing',
    author: 'Christian_Aslund',
    width: 7360,
    height: 4912,
    id: 124656371,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/124656371/m%3D2048/v2?user_id=20263175&webp=true&sig=b8e588260bfaa59cf0cd0f3a44e484e60eab9061ec7fed3c431d8196ba790210',
    type: 'temp'
  },
  {
    name: '潜水',
    author: '05d15a1d34309989cff4d4a12db499234',
    width: 2048,
    height: 1536,
    id: 227386667,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227386667/m%3D2048/v2?user_id=20263175&webp=true&sig=e8cade82d1d1d99db9e59a8a8452c7a592c7205775267f423d8a5ee8b6e4c0ba',
    type: 'temp'
  },
  {
    name: 'Nohoval Cove - Golden Hour',
    author: 'michalnaas',
    width: 3000,
    height: 1999,
    id: 227609399,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227609399/m%3D2048_k%3D1/v2?user_id=20263175&webp=true&sig=761f2672819d5b52b406f32f968c1d69b9447b09f486138ae21c9ddcb10a8512',
    type: 'temp'
  },
  {
    name: 'Mahouts and elephants',
    author: 'koapong',
    width: 2500,
    height: 1668,
    id: 227595639,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227595639/m%3D2048/v2?user_id=20263175&webp=true&sig=90b7206a0b4f48792d257e573b444e3030ff424b2dd681c1ba51d3ad481d1384',
    type: 'temp'
  },
  {
    name: 'Westrenen Photography',
    author: 'rwestrenen',
    width: 3543,
    height: 2362,
    id: 227456505,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227456505/m%3D2048/v2?user_id=20263175&webp=true&sig=cb678917b75fe1b58ba905e15bb8be2c1d6f905d48186b9fe9ad0588b55afd0e',
    type: 'temp'
  },
  {
    name: 'Elena',
    author: 'otschirner_photographie',
    width: 4928,
    height: 3264,
    id: 227453361,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227453361/m%3D2048/v2?user_id=20263175&webp=true&sig=58cf642b001bda35afe82c4a9d77a89365889936dd96e75fc93aceaa41754bc3',
    type: 'temp'
  },
  {
    name: 'Wave abstract',
    author: 'xlswell',
    width: 5760,
    height: 3840,
    id: 227449737,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227449737/m%3D2048_k%3D1/v2?user_id=20263175&webp=true&sig=21b4ad26911062ac38351f44e1a301ec9477d85e51e7ff8d27a1e930d2c02212',
    type: 'temp'
  },
  {
    name: 'Valensole Sunset (2015)',
    author: 'DavidSoulivetPhotographies',
    width: 2048,
    height: 1152,
    id: 227453929,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227453929/m%3D2048/v2?user_id=20263175&webp=true&sig=d4342a6913a503cbb6512c2086a7a7ece0f6b5f5c43f2f83b9fbe01c47435c77',
    type: 'temp'
  },
  {
    name: 'Core Temp and Symmetry',
    author: 'brxdlxy',
    width: 6000,
    height: 4000,
    id: 227456893,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227456893/m%3D2048/v2?user_id=20263175&webp=true&sig=4b24c3580b91fa28f8506a6fe35969f2b82f4549820f9a2f49ad6e44ff9189bb',
    type: 'temp'
  },
  {
    name: 'Paradise beach wedding portrait',
    author: 'ChristelleRall',
    width: 7360,
    height: 4912,
    id: 227314015,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227314015/m%3D2048/v2?user_id=20263175&webp=true&sig=19491b4a0cb58964aad33744787a29ac185663bb3d2a8c643fa75b5c0f1aa1ec',
    type: 'temp'
  },
  {
    name: '天路',
    author: 'vcg-haroldz',
    width: 2048,
    height: 810,
    id: 227293929,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227293929/m%3D2048/v2?user_id=20263175&webp=true&sig=e4b2fdf8b89f7d170ed0994a45533a54952288099ba4c498488ae62cf2b2a324',
    type: 'temp'
  },
  {
    name: 'Staring down Fall',
    author: 'everyonesjoyphotography',
    width: 6273,
    height: 4182,
    id: 227328533,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227328533/m%3D2048/v2?user_id=20263175&webp=true&sig=949943d1b0e6eb5eb4a9ed8e960e4dc733ced88b7923a330a072403be7ca8d70',
    type: 'temp'
  },
  {
    name: 'Aeromania 2017',
    author: 'anghelrusu',
    width: 5857,
    height: 3905,
    id: 227304693,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227304693/m%3D2048/v2?user_id=20263175&webp=true&sig=4aed286c66ca49f9ead91d4663f843653249f0cf71c855200eb163a208791ed3',
    type: 'temp'
  },
  {
    name: 'The black and white suit',
    author: '120471',
    width: 4582,
    height: 3745,
    id: 226521971,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/226521971/m%3D2048/v2?user_id=20263175&webp=true&sig=4b26288d398dd216be4f9af7005f68e0c3b32ee2ffc4b7e1fd079f370fc0142e',
    type: 'temp'
  },
  {
    name: 'Two Brothers, Coney Island',
    author: 'jonstockford',
    width: 4096,
    height: 2731,
    id: 227160467,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227160467/m%3D2048/v2?user_id=20263175&webp=true&sig=4aa075c31b08964210674d6b72f846fbf73043372fde0097d76931d37a99a991',
    type: 'temp'
  },
  {
    name: 'Hanging there !',
    author: 'ImgeIldem',
    width: 4608,
    height: 3072,
    id: 215794619,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/215794619/m%3D2048/v2?user_id=20263175&webp=true&sig=b447f6d464a691f119c87a8ef686a88f85c43e048a74c85a8ffee04618a7c57b',
    type: 'temp'
  },
  {
    name: 'Maiko - Kyoto, Japan',
    author: 'voyageway',
    width: 3415,
    height: 2277,
    id: 191503419,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/191503419/m%3D2048_k%3D1/v2?user_id=20263175&webp=true&sig=e88843b6a01217d312068f4f2914b492c21bc7f947449c26586322f76ce2f5aa',
    type: 'temp'
  },
  {
    name: "Elephant village",
    author: 'NarathaiVichienkalayarut',
    width: 2048,
    height: 1152,
    id: 227245273,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227245273/m%3D2048_k%3D1/v2?user_id=20263175&webp=true&sig=3e2954d2a7c0ec74324347c79abc9a98330ee4c92ac44aaeecf5f90d4176b1b6',
    type: 'temp'
  },
  {
    name: '老来乐',
    author: 'e3e62407b4c58bd442df79ca1733a5123',
    width: 2048,
    height: 1365,
    id: 227227173,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227227173/m%3D2048/v2?user_id=20263175&webp=true&sig=2a6a26ef5c9cddbb35af2924f0ddfe23d297de026be540754cafd9898c9bdae1',
    type: 'temp'
  },
  {
    name: 'Hang out with Monet No.2',
    author: 'vcg-riverlin7',
    width: 2048,
    height: 1365,
    id: 227229437,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227229437/m%3D2048/v2?user_id=20263175&webp=true&sig=6b2a5fd0bcf497923fa9942372c4973a2c0ee2ba72529254df063d419aa0c529',
    type: 'temp'
  },
  {
    name: 'Thunder in Venezia',
    author: 'Sebastien_Pollak',
    width: 4413,
    height: 3159,
    id: 227268873,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/227268873/m%3D2048/v2?user_id=20263175&webp=true&sig=087a52f1a250bdab3c895a92d4b0f622ece58367d499a64f9c444ae3f1dbae69',
    type: 'temp'
  },
  {
    name: 'Luca Moroni climbing in Verdon (FR).',
    author: 'saliniandrea',
    width: 5472,
    height: 3648,
    id: 168542245,
    format: 'jpeg',
    url: 'https://drscdn.500px.org/photo/168542245/m%3D2048_k%3D1/v2?user_id=20263175&webp=true&sig=ee640255fc61642da65f9a482163defd547d080a8ff15fb041cec4dd9ea10275',
    type: 'temp'
  }
]

// saveIndexImage({
//   name: "Elephant village",
//   author: 'NarathaiVichienkalayarut',
//   width: 2048,
//   height: 1152,
//   id: 227245273,
//   format: 'jpeg',
//   url: 'https://drscdn.500px.org/photo/227245273/m%3D2048_k%3D1/v2?user_id=20263175&webp=true&sig=3e2954d2a7c0ec74324347c79abc9a98330ee4c92ac44aaeecf5f90d4176b1b6',
//   type: 'temp'
// }).then(d => console.log(d)).catch(e => console.error(e))

// getIndexImage('temp').then(d => console.log(d)).catch(e => console.error(e))
updateIndexImage(227245273, 'like')