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
const {MD_OUTPUT_DIR, MD_DIR, SITE_NAME} = require('../env')
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

const getAllMarkdownHash = async function() {
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

    const filesInfo = await getAllMarkdownHash()
    const {result: DBFilesInfo} = await getBlogHash()
    filesInfo.forEach((fileInfo, i) => {
      DBFilesInfo.forEach((dbInfo, j) => {
        if (fileInfo.escapeName === dbInfo.escapeName) {
          if (fileInfo.hash === dbInfo.hash) {
            fileInfo.isNewFile = false
            DBFilesInfo.splice(j, 1)
            filesInfo.splice(i, 1)
          }
        }
      })
    })

    if (filesInfo.length) {
      Promise.all(filesInfo.map(info => singleRender(info)))
        .then(renderResults => {
          renderResults.forEach((r, i) => {
            let blogInfo = {
              title: r.title,
              originalFileName: filesInfo[i].originalFileName,
              escapeName: filesInfo[i].escapeName,
              createDateStr: r.date,
              createDate: new Date(r.date) * 1,
              tags: r.tags,
              abstract: r.abstract,
            }

            if (filesInfo[i].isNewFile) {
              blogInfo.readCount = 0
              blogInfo.commentCount = 0
            }
            delete filesInfo[i].isNewFile
            saveBlog(blogInfo)
              .then( (d) => {
                logger.info(`save ${blogInfo.originalFileName} info success`)
                saveBlogHash(filesInfo[i])
                  .then(_d => logger.info(`save ${filesInfo[i].originalFileName} hash success: `))
                  .catch(e => logger.error(`save ${filesInfo[i].originalFileName} hash error: `, e))
            })
              .catch(e => logger.error(`save ${blogInfo.originalFileName} info error: `, e))
          })

          logger.info('render all file success')
        })
        .catch(e => logger.error('render file failed, ', e))
    } else {
      logger.info('no new file')
    }



    if (DBFilesInfo.length) {
      logger.warn('hash in database is redundancy', DBFilesInfo)
    }
  } catch (e) {
    logger.error(e)
  }
}

renderAll()
