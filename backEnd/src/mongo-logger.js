/**
 * Created by maic on 2017/2/4.
 */

const winston = require('winston');
require('winston-mongodb').MongoDB;
let options = require('../env').mongoConfig.loggerConfig;
winston.add(winston.transports.MongoDB, options);

module.exports = winston;