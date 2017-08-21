/**
 * Created by maic on 02/03/2017.
 */

const scanAndRender = require('../scanMD');
const exec = require('child_process').exec;
const logger = require('../mongo-logger');

module.exports = function (req, res, next) {
    exec('git pull', function (err, stdout, stderr) {
        if (err) {
            logger.error('git pull error: ', err)
        } else {
            if (stdout.trim() === 'Already up-to-date.') {
                res.send('Already up-to-date.');
            } else {
                scanAndRender(function (r) {
                    if (r === 'prefect') {
                        logger.info('scan and render succeed.')
                    } else if (r === 'nothing new') {
                        logger.info('nothing new.')
                    } else {
                        logger.error('scan and render failed.')
                    }
                    res.json(r);
                });
            }
        }
    });

};