const saveOneShuoshuo = require('../db-op').saveOneShuoshuo;

exports.postShuoshuo = function (req, res, next) {
    console.log(req.files);
    res.status(200).send('收到请求了。');
    // 先把压缩图片弄好，然后数据库，再弄界面
    // 然后把js改成不用jquery的react
};