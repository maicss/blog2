const db = require('../db-op');
const moment = require('moment');
const marked = require('maic-marked');
const getShuoshuoList = db.getShuoshuoList;
const saveOneShuoshuo = db.saveOneShuoshuo;
const getShuoshuoSummary = db.getShuoshuoSummary;
const db_deleteShuoshuo = db.deleteShuoshuo;
const getuser = db.getUser;
const fs = require('fs');
const path = require('path')
module.exports = {
    getShuoshuoList: function (req, res, next) {
        let condition = {
            content: true
        };
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

        let date = moment();
        console.log(req.files)
        try {
            let body = JSON.parse(req.body.obj);
            body.isPublic = true;
            if (body.content.trim().startsWith('pre-')) {
                body.isPublic = false;
                body.content = body.content.substring(body.content.indexOf('pre-') + 'pre-'.length);
            }
            let content = {
                "date": date * 1,
                "dateStr": date.format(),
                "weather": body.weather,
                "content": new marked().exec(body.content).html,
                "images": [],
                "isPublic": body.isPublic
            };

            req.files.forEach(function (v) {
                content.images.push(v.path.substring('frontEnd'.length))
            });

            saveOneShuoshuo(content, function (d) {
                switch (d.opResStr) {
                    case 'success':
                        res.json(d.results.ops[0]);
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
            res.status(400).send({
                error: 'JSON Parse Error in post data: ' + req.body.obj
            });
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
    },
    deleteShuoshuo(req, res) {
        // todo 先检查说说是不是存在，再进行删除
        // 删除说说自带的图片
        req.query = {date: req.query.date * 1}
        getShuoshuoList(req.query, function (m) {
            if (m.results[0]) {
                if (m.results[0].images.length) {
                    try {
                        m.results[0].images.forEach(_path => {
                            fs.unlinkSync(path.resolve(__dirname, 'frontEnd' + _path))
                        })
                    } catch (e) {
                        console.log('delete shuoshuo -- remove shuoshuo images failed: ', e)
                    }
                }
                db_deleteShuoshuo(req.query, function (d) {
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
            } else {
                res.status(400).send({error: 'invalid query param.'})
            }
        })
    }
};