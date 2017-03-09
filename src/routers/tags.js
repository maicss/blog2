/**
 * Created by maic on 08/03/2017.
 * filter tags
 */
const getTag = require('../db-op').getTag;
module.exports = function (req, res, next) {
    getTag(req.body.tag, function (d) {
        switch (d.opResStr) {
            case 'success':
                res.json(d.results[0]);
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
};
