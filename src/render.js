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


module.exports = function (file) {
    let fileName = file + '.md';
    let output = path.join(OUTPUT, file + '.html');
    let permalink = SITE_NAME + output.replace('.public/', '');
    let filePath = path.resolve(MD_DIR, fileName);
    if (fs.lstatSync(filePath).isFile()) {
        fs.readFile(filePath, function (err, content) {
            if (err) {
                logger.error('renderMD module, read file error: ', err)
            } else {
                // todo marked 返回数据：marked，date，tags，摘要字符串，
                fs.writeFile(output,
                    mdTem(marked(content.toString()), file, permalink),
                    function (err) {
                        if (err) {
                            logger.error('renderMD module, write file error: ', err)
                        } else {
                            logger.info('renderMD module, render file succeed.');
                            //  save to db
                            // save
                        }
                    }
                )
            }
        });
    } else {
        throw new TypeError(file, 'is not a file.')
    }
};