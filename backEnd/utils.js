const fs = require('fs')
const promisify = require('util').promisify
const path = require('path')


const saveFileFromStream = async (fileStreamArr, destination) => {
  const promisifyPipe = (fileStream) => {
    return new Promise((res, rej) => {
      const finalPath = path.join(destination, new Date() * 1 + '-' + fileStream.name)
      const outStream = fs.createWriteStream(finalPath)
      const inStream = fs.createReadStream(fileStream.path)
      inStream.pipe(outStream)
      outStream.on('error', e => rej(e))
      inStream.on('error', e => rej(e))
      outStream.on('finish', function () {
        res(null, {
          destination: destination,
          filename: fileStream.name,
          path: finalPath,
          size: outStream.bytesWritten
        })
      })
    })
  }
  return await Promise.all(fileStreamArr.map(fileStream => promisifyPipe(fileStream)))
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

const AttrError = new Error()
AttrError.name = 'Attribute Missing Error'

module.exports = {
  logger,
  AuthorizationError,
  array2map,
  saveFileFromStream,
}