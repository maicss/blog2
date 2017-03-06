/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../scanMD');
const pull = require('../gitPull');
const logger = require('../mongo-logger');

module.exports = function (req, res, next) {
    // console.log('========== github push hook ==========');
    // console.log(req.body);
    // console.log('========== github push hook ==========');
    console.log(typeof req.body);
    console.log('github modified: ', Object.assign({}, req.body.commits.added, req.body.commits.removed, req.body.commits.modified));
    // pull

    pull(function (p) {
        if (p) {
            console.log('pull succeed.');
            scanAndRender(function (r) {
                if (r === 'prefect') {
                    logger.info('scan and render succeed.')
                } else {
                    logger.error('scan and render failed.')
                }
                res.json(r);
            });
        } else {
            // todo retry pull
        }
    });

};