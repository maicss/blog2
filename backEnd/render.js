/**
 * Created by maic on 01/03/2017.
 */
const fs = require('fs');
const path = require('path');

const marked = require('maic-marked');
const logger = require('./mongo-logger');
const mdTem = require('./md-template');

const MD_OUT_DIR = require('../env').MD_OUTPUT_DIR;
const MD_DIR = require('../env').MD_DIR;
const SITE_NAME = require('../env').SITE_NAME;


module.exports = function (fileInfo, callback) {

    let fileName = fileInfo.originalFileName + '.md';
    let output = path.resolve(__dirname, MD_OUT_DIR, fileInfo.escapeName + '.html');
    let permalink = SITE_NAME + output.replace('public/', '');
    let filePath = path.resolve(__dirname, MD_DIR, fileName);
    if (fs.lstatSync(filePath).isFile()) {
        fs.readFile(filePath, function (err, content) {
            if (err) {
                logger.error('renderMD module, read file error: ', err);
            } else {
                let renderResult = new marked().exec(content.toString());
                fs.writeFile(output,
                    mdTem(renderResult.html, fileInfo.escapeName, permalink)
                    , function (err) {
                        if (err) {
                            logger.error('renderMD module, write file error: ', err)
                        } else {
                            logger.info('renderMD module, render [ ' + fileInfo.escapeName + ' ] succeed.');
                        }
                    }
                );
                callback(renderResult);
            }
        });
    } else {
        throw new TypeError(fileInfo.originalFileName, 'is not a file.')
    }
};