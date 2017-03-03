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
const logger = require('./mongo-logger');
const pull = require('./gitPull');
const renderer = require('./render');

const MD_DIR = require('../env').MD_DIR;
const ALGORITHM = 'sha256';
const fileNameRegExp = /[\u4e00-\u9fa5\w()（） -]+\.md/;


let pullRes = new Promise(function (resolve, reject) {
    pull(function (r) {
        r ? resolve() : reject()
    })
});

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
                let abs_file = path.resolve(__dirname, MD_DIR, file);
                let sha = crypto.createHash(ALGORITHM);
                fs.readFile(abs_file, function (err, content) {
                    if (err) {
                        logger.error('scanMD module, read file error: ', err);
                        reject(err);
                    } else {
                        fileInfos.push({
                            originalFileName: path.parse(file).name,
                            escapeName: path.parse(file).name.replace(/[ _]/g, '-'),
                            sha: sha.update(content).digest('hex')
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

module.exports = function(callback) {
    pullRes.then(() => {
        Promise.all([readDBSha, readFileSha]).then(function (res) {
            let [{results: dbRes}, fileRes] = res;
            let copy = [...fileRes];
            for (let fileInfo of fileRes) {
                for (let dbInfo of dbRes) {
                    if (dbInfo.escapeName === fileInfo.escapeName && dbInfo.sha === fileInfo.sha) {
                        copy.splice(copy.indexOf(fileInfo), 1);
                        break;
                    }
                }
            }

            if (copy.length) {
                saveHash(copy, function (d) {
                    if (d.opResStr === 'success' && d.results.result.ok === 1) {
                        // render md
                        copy.forEach(info => {
                            renderer(info, function (renderResult) {
                                /*
                                 * todo:
                                 * date不存在，这个自己写的东西，出现的概率很小
                                 * readCount 和 commentCount 只能在初始化的时候赋值，而前面的代码是只要修改文件就会调用这个函数。
                                 * */
                                let publicInfo = {
                                    title: renderResult.title,
                                    originalFileName: info.originalFileName,
                                    escapeName: info.escapeName,
                                    createDateStr: renderResult.date,
                                    createDate: new Date(renderResult.date) * 1,
                                    tags: renderResult.tags,
                                    readCount: 0,
                                };
                                let postInfo = Object.assign({abstract: renderResult.abstract}, publicInfo);

                                savePostInfo(postInfo, function (d) {
                                    if (d.opResStr === 'success') {
                                        logger.info('scan and render and save post success.');
                                        callback('prefect');
                                    } else {
                                        logger.error('save post error: ', d.error || d.fault);
                                        callback('save db failed');
                                    }
                                });
                            });

                        });
                    } else {
                        logger('scanMD module, save hash error: ', d);
                        callback('save hash failed');
                    }
                })
            }

        }).catch(function (err) {
            // 这个logger没必要
            // logger.error('scanMD module, Promise all error: ', err);
            console.log(err)
        });
    }).catch(e => {
        // todo: retry
        logger.error('pull error or failed: ', e);
        callback('github pull failed');
    });
};






