/**
 * Created by maic on 2017/2/4.
 */

const winston = require('winston');
require('winston-mongodb').MongoDB;
let options = {
    db:'mongodb://127.0.0.1:27017/blog-test',
    collection:'logger',
};
// todo: 线上的数据库的用户名和密码的创建和使用
winston.add(winston.transports.MongoDB, options);

module.exports = winston;