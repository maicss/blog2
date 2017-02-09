const saveOneShuoshuo = require('../db-op').saveOneShuoshuo;
const moment = require('moment');

exports.postShuoshuo = function (req, res, next) {
    let d = moment();
    let body;
    try {
        body = JSON.parse(req.body.obj);
    } catch (e) {
        res.status(400).send('JSON Parse Error in post data.');
    }
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
                res.status(500).send(d.results[0]);
                break;
            case 'fault':
                res.status(400).send(d.results[0]);
                break;
        }
    });
    // 先把压缩图片弄好，然后数据库，再弄界面
    // 然后把js改成不用jquery的react
};