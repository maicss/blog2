/**
 * Created by maic on 12/02/2017.
 */

const moment = require('moment');
const getUser = require('../db-op').getUser;
const logger = require('../mongo-logger');


module.exports = function (req, res, next) {
    let user = req.body;
    getUser(user.username, function (d) {
        // switch (d.opResStr) {
        //     case 'success':
        //         if (d.results.result.ok === 1 && d.results.result.n === 1) {
        //             res.json(d.results.ops[0]);
        //             logger.info('save %s weather success', result.location.name);
        //         }
        //         break;
        //     case 'error':
        //         logger.warn('router weather error when get a new location: ', d.results[0]);
        //         res.status(400).send(d.results[0]);
        //         break;
        //     case 'fault':
        //         logger.error('router weather fault when get a new location: ', d.results[0]);
        //         res.status(500).send(d.results[0]);
        //         break;
        // };

        // todo: set cookies
        if (d.results.length && d.results[0].password === user.password) {
            // 如果长度为0，说明用户不存在；如果密码不匹配，说明密码不正确。但是这个没必要做……
            if (req.body.rememberMe && req.cookies.uid) {
                // let salt = 'naive';
                // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
                // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
                // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
                res.cookie('uid', d.results[0].createTime, {maxAge: 10 * 24 * 60 * 60 * 1000, httpOnly: true})
            }
            res.send('succeed');
        } else {
            res.status(401).send('failed')
        }
    })
};