/**
 * Created by maic on 01/03/2017.
 */
const fs = require('fs');
const path = require('path');
const highlight = require('highlight.js');

const marked = require('maic-marked');
const logger = require('./mongo-logger');
const mdTem = require('./md-template');
const savePostInfo = require('./db-op').savePostInfo;
const savePostAbstract = require('./db-op').savePostAbstract;

const OUTPUT = require('../env').MD_OUTPUT_DIR;
const MD_DIR = require('../env').MD_DIR;
const SITE_NAME = require('../env').SITE_NAME;

marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    }
});


module.exports = function (fileInfo, callback) {

    let fileName = fileInfo.originalFileName + '.md';
    let output = path.join(OUTPUT, fileInfo.escapeName + '.html');
    // todo: 这个replace太丑了，要重写
    let permalink = SITE_NAME + output.replace('../public/', '');
    let filePath = path.resolve(MD_DIR, fileName);
    if (fs.lstatSync(filePath).isFile()) {
        fs.readFile(filePath, function (err, content) {
            if (err) {
                logger.error('renderMD module, read file error: ', err);
            } else {
                let renderResult = marked(content.toString());
                // todo:没有等渲染完毕就callback，好诡异，但是渲染是异步，会导致后面的解析结果覆盖前面的。
                callback(renderResult);
                fs.writeFile(output,
                    mdTem(renderResult.html, fileInfo.escapeName, permalink),
                    function (err) {
                        if (err) {
                            logger.error('renderMD module, write file error: ', err)
                        } else {
                            logger.info('renderMD module, render file succeed.');
                        }
                    }
                )
            }
        });
    } else {
        throw new TypeError(fileInfo.originalFileName, 'is not a file.')
    }
};