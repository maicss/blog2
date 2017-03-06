/**
 * Created by maic on 01/03/2017.
 */
const getPost = require('../db-op').getPosts;
const updatePost = require('../db-op').updatePostInfo;
const logger = require('../mongo-logger');

module.exports = function (req, res, next) {
    // 做个缓存试试
    // let cachedRes = new Set();
    let pathReg = /^[\u4e00-\u9fa5\w-]+[^ /]$/;
    if (pathReg.test(req.params['0'])) {
        // let hasCached = false;
        // for (let post of cachedRes) {
        //     if (post.escapeName === req.params['0']) {
        //         hasCached = true;
        //         break;
        //     }
        // }
        // if (hasCached) {
        //     res.sendFile('./public/archives/' + d.results[0].escapeName + '.html', {root: './'});
        // } else {
            let query = {
                escapeName: req.params['0']
            };
            getPost(query, function (d) {
                if (d.opResStr === 'success') {
                    console.log(d);
                    let data = d.results[0];
                    data.readCount ++;
                    updatePost(data, function (d) {
                        if (d.opResStr === 'success') {
                            logger.info('router post module, update readCount success.')
                        }
                    });
                    // cachedRes.add(data);
                    res.sendFile('./public/archives/' + d.results[0].escapeName + '.html', {root: './'});
                } else {
                    res.status(404).send('NOT FOUND.')
                }
            });
        // }

    } else {
        res.status(400).send('aaa')
    }
    // getPostInfo({escapeName: });
};
