/**
 * Created by maic on 28/02/2017.
 */

/*
 * 在每次git pull之后运行。
 * 从给定的目录，检测本地所有文件的sha值
 * 跟数据库的sha值做对比
 * 用新的列表覆盖旧的列表
 * 返回有变化的文件列表
 * 这个模块跟网站逻辑没关系，是个定时执行的模块
 * */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const moment = require('moment');

const getHash = require('./db-op').getPostsSha;
const saveHash = require('./db-op').savePostsSha;
const savePostInfo = require('./db-op').savePostInfo;
const updatePostInfo = require('./db-op').updatePostInfo;
const saveTags = require('./db-op').saveTags;
const logger = require('./mongo-logger');
const renderer = require('./render');
const MD_DIR = require('../env').MD_DIR;

const ALGORITHM = 'sha256';
const fileNameRegExp = /[\u4e00-\u9fa5\w()（） -]+\.md/;


let readFileSha = new Promise(function (resolve, reject) {
    fs.readdir(path.resolve(__dirname, MD_DIR), function (err, files) {
        if (err) {
            logger.error('scanMD module, read dir error: ', err);
            reject(err);
        } else {
            let fileInfos = [];
            files.forEach((file, i) => {
                // 检测文件名称。文件名称只允许有空格和中划线，而且中划线只能用于特殊名词。
                if (!fileNameRegExp.test(file)) {
                    console.log(file, ' is not match given format');
                    return
                }
                let fileName = path.parse(file).name;
                let abs_file = path.resolve(__dirname, MD_DIR, file);
                let sha = crypto.createHash(ALGORITHM);
                fs.readFile(abs_file, function (err, content) {
                    if (err) {
                        logger.error('scanMD module, read file error: ', err);
                        reject(err);
                    } else {
                        fileInfos.push({
                            originalFileName: fileName,
                            escapeName: fileName.replace(/[ _]/g, '-'),
                            sha: sha.update(content).digest('hex'),
                            isNewFile: true,
                        });
                    }
                    if (i === files.length - 1) {
                        resolve(fileInfos)
                    }
                });
            });
        }
    });
});

let readDBSha = new Promise(function (resolve, reject) {
    getHash(function (d) {
        if (d.opResStr === 'success') {
            resolve(d)
        } else {
            reject(d)
        }
    })
});

module.exports = function (callback) {
    Promise.all([readDBSha, readFileSha]).then(function (res) {
        let [{results: dbRes}, fileRes] = res;
        let fileResCopy = [...fileRes];
        for (let fileInfo of fileRes) {
            fileInfo.isNewFile = true;
            for (let dbInfo of dbRes) {
                if (dbInfo.escapeName === fileInfo.escapeName) {

                    if (dbInfo.sha === fileInfo.sha) {
                        fileResCopy.splice(fileResCopy.indexOf(fileInfo), 1);
                        break;
                    } else {
                        fileInfo.isNewFile = false;
                    }
                }
            }
        }

        if (fileResCopy.length) {
            let handleOneFile = function (fileList) {
                let info;
                if (info = fileList.pop()) {
                    new Promise(function (resolve) {
                        renderer(info, function (renderResult) {
                            resolve(renderResult)
                        });
                    }).then(function (renderResult) {
                        if (renderResult.tags.length) {
                            saveTags({tags: renderResult.tags, post: info.escapeName});
                        }
                        return (renderResult);
                    }).then(function (renderResult) {
                        let postInfo = {
                            title: renderResult.title,
                            originalFileName: info.originalFileName,
                            escapeName: info.escapeName,
                            createDateStr: renderResult.date,
                            createDate: new Date(renderResult.date) * 1,
                            tags: renderResult.tags,
                            abstract: renderResult.abstract,
                        };

                        if (info.isNewFile) {
                            postInfo.readCount = 0;
                            savePostInfo(postInfo, function (d) {
                                if (d.opResStr === 'success') {
                                    logger.info('scan and render and save post success.');
                                    callback('prefect');
                                } else {
                                    logger.error('save post error: ', d.error || d.fault);
                                    callback('save db failed');
                                }
                            });
                        } else {
                            updatePostInfo(postInfo, function (d) {
                                if (d.opResStr === 'success') {
                                    logger.info('scan and render and save post success.');
                                    callback('prefect');
                                } else {
                                    logger.error('save post error: ', d.error || d.fault);
                                    callback('save db failed');
                                }
                            });
                        }
                    }).then(function () {
                        delete info.isNewFile;
                        saveHash(info);
                        return fileList
                    }).catch(function (e) {
                        logger.error('render Promise error: ', e)
                    }).then(function (list) {
                        if (list.length) return handleOneFile(list)
                    });
                }
            };
            handleOneFile(fileResCopy)

        } else {
            callback('nothing new.')
        }

    }).catch(function (err) {
        // 这个logger没必要
        // logger.error('scanMD module, Promise all error: ', err);
        console.log(err)
    });
};






