/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../scanMD');
const logger = require('../mongo-logger');

module.exports = function (req, res, next) {
    // console.log('========== github push hook ==========');
    // console.log(req.body);
    // console.log('========== github push hook ==========');
    console.log(Object.assign({}, req.body.commits.added, req.body.commits.removed, req.body.commits.modified));
    scanAndRender(function (r) {
        if (r === 'prefect') {
            logger.info('scan and render succeed.')
        } else {
            logger.error('scan and render failed.')
        }
        res.json(r);
    });
};