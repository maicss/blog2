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

const array2map = (list, key) => {
  if (Array.isArray(list)) {
    const newMap = {}
    list.forEach(item => {
      let _key = item[key]
      if (!_key) {
        throw new Error('key not exist')
      }
      if (newMap[_key]) {
        throw new Error('key value not unique')
      }
      newMap[_key] = item
    })
    return newMap
  } else {
    throw new TypeError ('argument 1 not an array')
  }
}

const shellLoggerSetting = {
  format: [
    '{{timestamp}} <{{title}}> (in {{file}}:{{line}}) {{message}}', //default format
    {
      error: '{{timestamp}} <{{title}}> (in {{file}}:{{line}}) {{message}}\nCall Stack:\n{{stack}}' // error format
    }
  ],
  dateformat: 'mm-dd HH:MM:ss'
}
const logger = require('tracer').colorConsole(shellLoggerSetting)

// todo build some private error type
const AuthorizationError = new Error()
AuthorizationError.name = 'AuthorizationError'

module.exports = {
  logger,
  AuthorizationError,
  array2map,
}