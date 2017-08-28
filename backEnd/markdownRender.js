/**
 * Created by maic on 28/02/2017.
 */

const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const crypto = require('crypto')
const path = require('path')

const {getBlogHash, saveBlogHash, saveBlog} = require('./databaseOperation')
const {logger} = require('./utils')
const marked = require('maic-marked')
const mdTem = require('./md-template')
const {MD_OUTPUT_DIR, MD_DIR, SITE_NAME} = require('../env').MD_OUTPUT_DIR
const ALGORITHM = 'sha256'
const fileNameRegExp = /[\u4e00-\u9fa5\w()（） -]+\.md/

const singleRender =  async (fileInfo) => {

  let fileName = fileInfo.originalFileName + '.md'
  let output = path.resolve(__dirname, MD_OUTPUT_DIR, fileInfo.escapeName + '.html')
  let permalink = SITE_NAME + output.replace('frontEnd/', '')
  let filePath = path.resolve(__dirname, MD_DIR, fileName)
  let fileStat = await lstat(filePath)
  if (fileStat.isFile()) {
    try {
      const MDContent = await readFile(filePath)
      let renderResult = new marked().exec(MDContent.toString())
      await writeFile(output, mdTem(renderResult.html, fileInfo.escapeName, permalink))
      logger.info('write file: [' + fileInfo.escapeName + '.html] success.')
      return renderResult
    } catch (e) {
      logger.error(e)
    }
  } else {
    throw new TypeError(fileInfo.originalFileName, 'is not a file.')
  }
}

const getAllMarkdownHash = async () => {
  try {
    let files = await readdir(path.resolve(__dirname, MD_DIR))
    return Promise.all(files.map(file => {
      if (!fileNameRegExp.test(file)) {
        logger.error(file, ' not match given format')
        throw Error(file + ' not match given format')
      }
      let filename = path.parse(file).name
      let fileAbsPath = path.resolve(__dirname, MD_DIR, file)
      const sha = crypto.createHash(ALGORITHM)
      return readFile(fileAbsPath).then(content => ({
        originalFileName: filename,
        escapeName: filename.replace(/[ _]/g, '-'),
        sha: sha.update(content).digest('hex'),
        isNewFile: true,
      })).catch(e => logger.error('read MD file error', e))
    }))
  } catch (e) {
    logger.error(e)
  }
}

const renderAll = async () => {
  try {

    let filesInfo = await getAllMarkdownHash()
    let {result: DBFilesInfo} = await getBlogHash()
    const newFilesInfo = []
    filesInfo.forEach((fileInfo, i) => {
      DBFilesInfo.forEach((dbInfo, j) => {
        if (fileInfo.escapeName === dbInfo.escapeName) {
          if (fileInfo.hash === dbInfo.hash) {
            newFilesInfo.push(fileInfo)
          } else {
            DBFilesInfo.splice(j, 1)
            filesInfo.splice(i, 1)
          }
        }
      })
    })

    if (newFilesInfo.length) {
      Promise.all(newFilesInfo.map(info => singleRender(info)))
        .then(renderResults => logger.info('render all file success'))
        .catch(e => logger.error('render file failed, ', e))
      // todo 这个只能处理单个的
      let saveInfoRes = await saveBlogHash(newFilesInfo)
      if (saveInfoRes.result.length === newFilesInfo.length) {

      }
    } else {
      logger.info('no new file')
    }



    if (DBFilesInfo.length) {
      logger.warn('hash in database is redundancy', DBFilesInfo)
    }

    console.log(DBFilesInfo)
  } catch (e) {
    logger.error(e)
  }
  // Promise.all([readDBSha, readFileSha]).then(function (res) {
  //   let [{results: dbRes}, fileRes] = res
  //   let fileResCopy = [...fileRes]
  //   for (let fileInfo of fileRes) {
  //     fileInfo.isNewFile = true
  //     for (let dbInfo of dbRes) {
  //       if (dbInfo.escapeName === fileInfo.escapeName) {
  //
  //         if (dbInfo.sha === fileInfo.sha) {
  //           fileResCopy.splice(fileResCopy.indexOf(fileInfo), 1)
  //           break
  //         } else {
  //           fileInfo.isNewFile = false
  //         }
  //       }
  //     }
  //   }
  //
  //   if (fileResCopy.length) {
  //     let handleOneFile = function (fileList) {
  //       let info
  //       if (info = fileList.pop()) {
  //         new Promise(function (resolve) {
  //           renderer(info, function (renderResult) {
  //             resolve(renderResult)
  //           })
  //         }).then(function (renderResult) {
  //           if (renderResult.tags.length) {
  //             saveTags({tags: renderResult.tags, post: info.escapeName})
  //           }
  //           return (renderResult)
  //         }).then(function (renderResult) {
  //           let postInfo = {
  //             title: renderResult.title,
  //             originalFileName: info.originalFileName,
  //             escapeName: info.escapeName,
  //             createDateStr: renderResult.date,
  //             createDate: new Date(renderResult.date) * 1,
  //             tags: renderResult.tags,
  //             abstract: renderResult.abstract,
  //           }
  //
  //           if (info.isNewFile) {
  //             postInfo.readCount = 0
  //             saveBlog(postInfo, function (d) {
  //               if (d.opResStr === 'success') {
  //                 console.info('scan and render and save post success.')
  //                 callback('prefect')
  //               } else {
  //                 console.error('save post error: ', d.error || d.fault)
  //                 callback('save db failed')
  //               }
  //             })
  //           } else {
  //             updatePostInfo(postInfo, function (d) {
  //               if (d.opResStr === 'success') {
  //                 console.info('scan and render and save post success.')
  //                 callback('prefect')
  //               } else {
  //                 console.error('save post error: ', d.error || d.fault)
  //                 callback('save db failed')
  //               }
  //             })
  //           }
  //         }).then(function () {
  //           delete info.isNewFile
  //           saveBlogHash(info)
  //           return fileList
  //         }).catch(function (e) {
  //           console.error('render Promise error: ', e)
  //         }).then(function (list) {
  //           if (list.length) return handleOneFile(list)
  //         })
  //       }
  //     }
  //     handleOneFile(fileResCopy)
  //
  //   } else {
  //     callback('nothing new.')
  //   }
  //
  // }).catch(function (err) {
  //   // 这个logger没必要
  //   // logger.error('scanMD module, Promise all error: ', err);
  //   console.log(err)
  // })
}

renderAll()
