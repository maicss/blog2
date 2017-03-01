/**
 * Created by maic on 28/02/2017.
 */

/*
 * 在每次git pull之后运行。
 * 从给定的目录，检测本地所有文件的sha值
 * 跟数据库的sha值做对比
 * 用新的列表覆盖旧的列表
 * 返回有变化的文件列表
 * */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const getHash = require('./db-op').getPostsSha;
const saveHash = require('./db-op').savePostsSha;
const logger = require('./mongo-logger');
const pull = require('./gitPull');
const renderer = require('./render');

const MD_DIR = require('../env').MD_DIR;
const ALGORITHM = 'sha256';
const fileNameRegExp = /([\u4e00-\u9fa5\w() -]+)+\.md/;


let pullRes = new Promise(function (resolve, reject) {
    pull(function (r) {
        r ? resolve() : reject()
    })
});

let readFileSha = new Promise(function (resolve, reject) {
    fs.readdir(MD_DIR, function (err, files) {
        if (err) {
            logger.error('scanMD module, read dir error: ', err);
            reject(err);
        } else {
            let fileInfos = [];
            files.forEach((file, i) => {
                // 检测文件名称。文件名称只允许有空格和中划线，而且中划线只能用于特殊名词。
                if (!fileNameRegExp.match(file)) {
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
                            name: path.parse(file).name,
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

pullRes.then(Promise.all([readDBSha, readFileSha]).then(function (res) {
        let [{results: dbRes}, fileRes] = res;
        let copy = [...fileRes];
        for (let index in fileRes) {
            let fileInfo = fileRes[index];
            for (let dbInfo of dbRes) {
                if (dbInfo.name === fileInfo.name) {
                    if (dbInfo.sha === fileInfo.sha) {
                        copy.splice(index, i)
                    }
                    break
                }
            }
        }

        if (copy.length) {
            saveHash(copy, function (d) {
                if (d.opResStr === 'success' && d.results.result.ok === 1) {
                    // render md
                    copy.forEach(info => {
                        renderer(info.name)
                    });
                } else {
                    logger('scanMD module, save hash error: ', d);
                }
            })
        }

    }).catch(function (err) {
        // 这个logger没必要
        // logger.error('scanMD module, Promise all error: ', err);
        console.log(err)
    })
);






