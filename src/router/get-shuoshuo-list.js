const getShuoshuoList = require('../db-op').getShuoshuoList;
exports.getShuoshuoList = function (req, res, next) {
    let condition = {limit: 10};
    condition.isPublic = !req.client.authorized;
    console.log('authorized: ', req.client.authorized);
    condition = Object.assign(condition, req.body);
    try {
        getShuoshuoList(condition, function (result) {
            if (result.fault) {
                res.status(400).send(result.fault.name + ': ' + result.fault.message);
            } else if (result.err) {
                res.status(404).send(result.err)
            } else {
                res.status(200).send(result.res)
            }
        })
    }
    catch (e) {
        console.log('get-shuoshuo-list error: ', e);
        res.status(404).send(e)
    }
};
