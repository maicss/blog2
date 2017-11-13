const fs = require('fs')
const path = require('path')
const tracer = require('tracer')
const r = require('request')

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
        res({
          rawFile: fileStream,
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


// const array2map = (list, key) => {
//   if (Array.isArray(list)) {
//     const newMap = {}
//     list.forEach(item => {
//       let _key = item[key]
//       if (!_key) {
//         throw new Error('key not exist')
//       }
//       if (newMap[_key]) {
//         throw new Error('key value not unique')
//       }
//       newMap[_key] = item
//     })
//     return newMap
//   } else {
//     throw new TypeError ('argument 1 not an array')
//   }
// }

const shellLoggerSetting = {
  format: [
    '{{timestamp}} [{{title}}] (in {{file}}:{{line}}) {{message}}', //default format
    {
      error: '{{timestamp}} [{{title}}] (in {{file}}:{{line}}) {{message}}\nCall Stack:\n{{stack}}' // error format
    }
  ],
  dateformat: 'yyyy-mm-dd HH:MM:ss',
  transport (data) {
    console.log(data.output);
    fs.appendFile('./WEBSITE.log', data.output + '\n', (err) => {
      if (err) throw err;
    });
  }
}
const logger = tracer.colorConsole(shellLoggerSetting)

const request = url => {
  return new Promise((res, rej) => {
    r(url, (err, resp) => {
      if (err) rej(err)
      res(resp.body)
    })
  })
}

// class ExtendableError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = this.constructor.name;
//     if (typeof Error.captureStackTrace === 'function') {
//       Error.captureStackTrace(this, this.constructor);
//     } else {
//       this.stack = (new Error(message)).stack;
//     }
//   }
// }

module.exports = {
  logger,
  request,
  // array2map,
  saveFileFromStream,
  // ExtendableError,
}
