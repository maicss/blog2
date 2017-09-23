/**
 * Created by maic on 28/02/2017.
 */

const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const readFile = util.promisify(fs.readFile)
// const writeFile = util.promisify(fs.writeFile)
const crypto = require('crypto')
const path = require('path')

const {getBlogHash, saveBlogHash, saveBlog} = require('./database')
const {logger} = require('./utils')
const marked = require('maic-marked')
// const mdTem = require('./md-template')
const {MD_OUTPUT_DIR, MD_DIR, SITE_NAME} = require('../env')
const ALGORITHM = 'sha256'
const fileNameRegExp = /[\u4e00-\u9fa5\w()（） -]+\.md/

const singleRender = async (fileInfo) => {

  let fileName = fileInfo.originalFileName + '.md'
  // let output = path.resolve(__dirname, MD_OUTPUT_DIR, fileInfo.escapeName + '.html')
  // let permalink = SITE_NAME + output.replace('frontEnd/', '')
  let filePath = path.resolve(__dirname, MD_DIR, fileName)
  let fileStat = await lstat(filePath)
  if (fileStat.isFile()) {
    try {
      const MDContent = await readFile(filePath)
      let renderResult = new marked().exec(MDContent.toString())
      if (!renderResult.date) {
        return new Error(fileName + ' has no date')
      } else if (!renderResult.toc.length) {
        return new Error(fileName + ' has no toc')
      } else if (!renderResult.abstract) {
        return new Error(fileName + ' has no abstract')
      } else if (!renderResult.tags.length) {
        return new Error(fileName + ' has no tags')
      } else if (!renderResult.title) {
        return new Error(fileName + ' has no title')
      }
      // 前端渲染就不需要生成静态文件了
      // await writeFile(output, mdTem(renderResult.html, fileInfo.escapeName, permalink))
      // logger.info('write file: [' + fileInfo.escapeName + '.html] success.')
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
        hash: sha.update(content).digest('hex'),
        isNewFile: true,
      })).catch(e => logger.error('read MD file error', e))
    }))
  } catch (e) {
    logger.error(e)
  }
}

const renderAll = async (forceRender) => {
  /**
   * forceRender: 是否忽略数据库信息强制渲染所有文件
   * */
  try {
    const filesInfo = await getAllMarkdownHash()
    const filesInfoCopy = [...filesInfo]
    let DBFilesInfoCopy = []
    if (!forceRender) {
      const DBFilesInfo = await getBlogHash()
      DBFilesInfoCopy = [...DBFilesInfo]

      // 比对本地文件和数据库的hash
      filesInfo.forEach((fileInfo) => {
        DBFilesInfo.forEach((dbInfo) => {
          if (fileInfo.escapeName === dbInfo.escapeName) {
            DBFilesInfoCopy.splice(DBFilesInfoCopy.indexOf(dbInfo), 1)
            fileInfo.isNewFile = false
            if (fileInfo.hash === dbInfo.hash) {
              filesInfoCopy.splice(filesInfoCopy.indexOf(fileInfo), 1)
            }
          }
        })
      })
    }

    const needRenderFileCount = filesInfoCopy.length
    if (needRenderFileCount) {
      for (let i = 0; i < needRenderFileCount; i++) {
        (async () => {
          try {
            const renderResult = await singleRender(filesInfoCopy[i])
            let blogInfo = {
              originalFileName: filesInfoCopy[i].originalFileName,
              escapeName: filesInfoCopy[i].escapeName,
              isPublic: true,
            }
            // private parse
            if (renderResult.title.startsWith('pre-')) {
              blogInfo.isPublic = false
              renderResult.title = renderResult.title.substring('pre-'.length)
            }
            blogInfo = Object.assign(blogInfo, renderResult)
            if (filesInfoCopy[i].isNewFile) {
              blogInfo.readCount = 0
              blogInfo.commentCount = 0
            }
            delete filesInfoCopy[i].isNewFile
            await saveBlog(blogInfo)
            await saveBlogHash(filesInfoCopy[i])
          } catch (e) {
            logger.error('during render markdown and save info to db error: ', e)
          }
        })()
      }
      // Promise.all(filesInfoCopy.map(info => singleRender(info)))
      //   .then(renderResults => {
      //     renderResults.forEach((r, i) => {
      //       let blogInfo = {
      //         title: r.title,
      //         originalFileName: filesInfoCopy[i].originalFileName,
      //         escapeName: filesInfoCopy[i].escapeName,
      //         createDateStr: r.date,
      //         createDate: new Date(r.date) * 1,
      //         tags: r.tags,
      //         abstract: r.abstract,
      //       }
      //
      //       if (filesInfoCopy[i].isNewFile) {
      //         blogInfo.readCount = 0
      //         blogInfo.commentCount = 0
      //       }
      //       delete filesInfoCopy[i].isNewFile
      //       // 保存blog信息
      //       saveBlog(blogInfo)
      //         .then((d) => {
      //           logger.info(`save ${blogInfo.originalFileName} info success`)
      //           // 保存hash信息
      //           saveBlogHash(filesInfoCopy[i])
      //             .then(_d => logger.info(`save ${filesInfoCopy[i].originalFileName} hash success: `))
      //             .catch(e => logger.error(`save ${filesInfoCopy[i].originalFileName} hash error: `, e))
      //         })
      //         .catch(e => logger.error(`save ${blogInfo.originalFileName} info error: `, e))
      //     })
      //
      //     logger.info('render all file success')
      //   })
      //   .catch(e => logger.error('render file failed, ', e))
    } else {
      logger.info('no new file')
      return 'no new file'
    }

    if (DBFilesInfoCopy.length) {
      // 正常情况下，本地文件的信息应该是大于等于数据库的信息
      logger.warn('hash in database is redundancy', DBFilesInfoCopy)
    }
    logger.info(`${filesInfoCopy.map(i => i.originalFileName)} success`)
  } catch (e) {
    logger.error(e)
  }
}

module.exports = renderAll
