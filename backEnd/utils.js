/**
 * 构建统一的返回错误
 * @param e{Error | Object} 错误对象
 * @param type {String}[] 错误的级别
 * @param desc {String}[] 错误描述
 * @return {Object}
 * */
const buildDatabaseRes = (e, type, desc) => {
  if (e instanceof Error) {
    if (!['fault', 'error'].includes(type)) {
      throw Error('build param - type invalid.')
    }
    return Promise.reject({
      status: type,
      result: {
        name: e.name,
        message: e.message,
        desc
      }
    })
  } else {
    return {
      status: 'success',
      result: e
    }
  }
}

module.exports = {
  buildDatabaseRes
}