/**
 * Created by maic on 28/02/2017.
 */

const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const lstat = util.promisify(fs.lstat)
const readFile = util.promisify(fs.readFile)
const crypto = require('crypto')
const path = require('path')

const marked = require('maic-marked')

const {
  getBlogHash,
  saveBlogHash,
  saveBlog
} = require('./database')
const {
  logger
} = require('./utils')
const {
  MD_DIR
} = require('../env')
const ALGORITHM = 'sha256'
const fileNameRegExp = /[\u4e00-\u9fa5\w()（） -]+\.md/

const singleRender = async (fileInfo) => {

  let fileName = fileInfo.originalFileName + '.md'
  let filePath = path.resolve(__dirname, MD_DIR, fileName)
  let fileStat = await lstat(filePath)
  if (fileStat.isFile()) {
    const MDContent = await readFile(filePath)
    let renderResult = new marked().exec(MDContent.toString())
    if (!renderResult.date) {
      throw new TypeError(fileName + ' has no date')
    } else if (!renderResult.toc) {
      throw new TypeError(fileName + ' has no toc')
    } else if (!renderResult.abstract) {
      throw new TypeError(fileName + ' has no abstract')
    } else if (!renderResult.tags.length) {
      throw new TypeError(fileName + ' has no tags')
    } else if (!renderResult.title) {
      throw new TypeError(fileName + ' has no title')
    }
    return renderResult
  } else {
    throw new TypeError(fileInfo.originalFileName, 'is not a file.')
  }
}

const getAllMarkdownHash = async () => {
  let files = await readdir(path.resolve(__dirname, MD_DIR))
  const filesInfo = []
  for (let file of files) {
    if (!fileNameRegExp.test(file)) {
      throw Error(file + ' not match given format')
    }
    let filename = path.parse(file).name
    let fileAbsPath = path.resolve(__dirname, MD_DIR, file)
    const sha = crypto.createHash(ALGORITHM)
    const content = await readFile(fileAbsPath)
    filesInfo.push({
      originalFileName: filename,
      escapeName: filename.replace(/[ _]/g, '-'),
      hash: sha.update(content).digest('hex'),
      isNewFile: true
    })
  }
  return filesInfo
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

        let renderResult
        try {
          renderResult = await singleRender(filesInfoCopy[i])

          let blogInfo = {
            originalFileName: filesInfoCopy[i].originalFileName,
            escapeName: filesInfoCopy[i].escapeName,
            isPublic: true
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
          try {
            await saveBlog(blogInfo)
            await saveBlogHash(filesInfoCopy[i])
          } catch (e) {
            logger.error('save info/hash to db error: ', e)
          }

        } catch (e) {
          logger.error('parse single markdown error: ', e)
        }
      }
    } else {
      logger.info('no new file')
      return 'no new file'
    }

    if (DBFilesInfoCopy.length) {
      // 正常情况下，本地文件的信息应该是大于等于数据库的信息
      logger.warn('hash in database is redundancy', DBFilesInfoCopy)
    }
    logger.info(`${filesInfoCopy.map(i => i.originalFileName)} success`)
    return `${filesInfoCopy.map(i => i.originalFileName)} success`
  } catch (e) {
    logger.error(e)
    return 'some error occurred during render markdown.'
  }
}

module.exports = renderAll