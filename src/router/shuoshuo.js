const db = require('../db-op');
const moment = require('moment');
const getShuoshuoList = db.getShuoshuoList;
const saveOneShuoshuo = db.saveOneShuoshuo;
const getShuoshuoSummary = db.getShuoshuoSummary;
const getuser = db.getUser;
module.exports = {
    getShuoshuoList: function (req, res, next) {
        let condition = {limit: 10};
        condition.isPublic = !req.client.authorized;
        console.log('check authorized in router get shuoshuo list: ', req.client.authorized);
        if (req.body.filter && req.body.filter !== 'all') {
            condition.dateStr = new RegExp("^" + req.body.filter);
        } else {
            condition = Object.assign(condition, req.body);
        }
        getShuoshuoList(condition, function (d) {
            switch (d.opResStr) {
                case 'success':
                    res.json(d.results);
                    break;
                case 'error':
                    res.status(400).send(d.results[0]);
                    break;
                case 'fault':
                    res.status(500).send(d.results[0]);
                    break;
            }
        })
    },
    postShuoshuo: function (req, res, next) {
        // if (req.client.authorized)
        // todo : 这里再验证一下是不是有效用户
        if (!req.cookies.uid) {
            res.status(401).json({error: 'please login and retry.'});
        } else {
            getuser({createTime: req.cookies.uid * 1}, function (d) {
                if (!d.results.length) {
                    res.status(401).send({error: 'please login and retry.'});
                } else {
                    let d = moment();
                    try {
                        let body = JSON.parse(req.body.obj);
                        let content = {
                            "date": d * 1,
                            "dateStr": d.format(),
                            "weather": body.weather,
                            "content": body.content,
                            "images": [],
                            "isPublic": true
                        };

                        req.files.forEach(function (v) {
                            content.images.push(v.path.substring('public'.length))
                        });

                        if (body.content.startsWith('pre')) {
                            content.isPublic = false;
                            content.content = body.content.substring('pre'.length);
                        }

                        saveOneShuoshuo(content, function (d) {
                            switch (d.opResStr) {
                                case 'success':
                                    res.json(d.results);
                                    // res.json({status: 'success', n: 1});
                                    break;
                                case 'error':
                                    res.status(400).send(d.results[0]);
                                    break;
                                case 'fault':
                                    res.status(500).send(d.results[0]);
                                    break;
                            }
                        });
                    } catch (e) {
                        res.status(400).send({error: 'JSON Parse Error in post data.' + req.body.obj});
                    }

                }
            })
        }

    },
    getSummary: function (req, res, next) {
        getShuoshuoSummary(function (d) {
            switch (d.opResStr) {
                case 'success':
                    res.json(d.results);
                    break;
                case 'error':
                    res.status(400).send(d.results[0]);
                    break;
                case 'fault':
                    res.status(500).send(d.results[0]);
                    break;
            }
        })
    }
};