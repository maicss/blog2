const saveOneShuoshuo = require('../db-op').saveOneShuoshuo;
const moment = require('moment');

exports.postShuoshuo = function (req, res, next) {
    let d = moment();
    let body = JSON.parse(req.body.obj);
    let content = {
        "date": d * 1,
        "dateStr": d.format(),
        "weather": body.weather,
        "content": body.content,
        "images": [],
        "isPublic": true
    };
    console.log(req.files);

    req.files.forEach(function (v) {
        content.images.push(v.path.substring('public'.length))
    });

    if (body.content.startsWith('赖龙帝都')) {
        content.isPublic = false;
        content.content = body.content.substring('赖龙帝都'.length);
    }

    saveOneShuoshuo(content, function (d) {
        if (d.res) {
            res.json({res: {status: 'success'}});
        } else if (d.fault) {
            // todo: more specific
            res.status(500).send({err: {status: 'fail', type: 'Mongodb err'}});
        } else {
            res.status(500).send({err: {status: 'fail', type: d.err.name, message: d.err.message}});
        }
    });
    // 先把压缩图片弄好，然后数据库，再弄界面
    // 然后把js改成不用jquery的react
};