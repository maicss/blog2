/**
 * Created by maic on 12/02/2017.
 */

const moment = require('moment');
const getUser = require('../db-op').getUser;
const logger = require('../mongo-logger');


module.exports = {
    login: function (req, res, next) {
        let user = req.body;
        getUser({username: user.username}, function (d) {
            // todo: set cookies
            if (d.results.length && d.results[0].password === user.password) {
                // 如果长度为0，说明用户不存在；如果密码不匹配，说明密码不正确。但是这个没必要做……
                if (req.body.rememberMe === 'true') {
                    // cookie encrypt
                    // let salt = 'naive';
                    // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
                    // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
                    // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
                    res.cookie('uid', d.results[0].createTime, {maxAge: 10 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true});
                    res.cookie('login', 'bingo', {maxAge: 10 * 24 * 60 * 60 * 1000});
                } else {
                    res.cookie('uid', d.results[0].createTime, {httpOnly: true});
                    res.cookie('login', 'bingo');
                }
                res.send('succeed');
            } else {
                res.status(401).send('failed')
            }
        })
    },
    logout: function (req, res, next) {
        res.clearCookie('uid');
        res.clearCookie('login');
        res.send('succeed')
    }
};