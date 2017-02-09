const getShuoshuoList = require('../db-op').getShuoshuoList;
exports.getShuoshuoList = function (req, res, next) {
    let condition = {limit: 10};
    condition.isPublic = !req.client.authorized;
    console.log('check authorized in router get shuoshuo list: ', req.client.authorized);
    condition = Object.assign(condition, req.body);
    getShuoshuoList(condition, function (d) {
        switch (d.opResStr) {
            case 'success':
                res.json(d.results);
                break;
            case 'error':
                res.status(500).send(d.results[0]);
                break;
            case 'fault':
                res.status(400).send(d.results[0]);
                break;
        }
    })
};
