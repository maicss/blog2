const db = require('../db-op');
const moment = require('moment');
const marked = require('maic-marked');
const getShuoshuoList = db.getShuoshuoList;
const saveOneShuoshuo = db.saveOneShuoshuo;
const getShuoshuoSummary = db.getShuoshuoSummary;
const getuser = db.getUser;
module.exports = {
    getShuoshuoList: function (req, res, next) {
        let condition = {content: true};
        condition.isPublic = !(req.cookies.login === 'bingo');
        if (req.query.filter && req.query.filter !== 'all') {
            condition.dateStr = new RegExp("^" + req.query.filter);
        }
        if (req.query.timeMark && req.query.timeMark !== '0') {
            condition.timeMark = req.query.timeMark;
        }
        condition.limit = Number(req.query.limit) || 10;
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
                        body.isPublic = true;
                        if (body.content.trim().startsWith('pre')) {
                            body.isPublic = false;
                            body.content = body.content.substring(body.content.indexOf('pre') + 'pre'.length);
                        }
                        let content = {
                            "date": d * 1,
                            "dateStr": d.format(),
                            "weather": body.weather,
                            "content": new marked().exec(body.content).html,
                            "images": [],
                            "isPublic": body.isPublic
                        };

                        req.files.forEach(function (v) {
                            content.images.push(v.path.substring('public'.length))
                        });

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
                        res.status(400).send({error: 'JSON Parse Error in post data: ' + req.body.obj});
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
