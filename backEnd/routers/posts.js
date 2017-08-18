/**
 * Created by maic on 01/03/2017.
 */
const getPost = require('../db-op').getPosts;
const updatePost = require('../db-op').updatePostInfo;
const getAbstracts = require('../db-op').getAbstracts;
const getPostByTag = require('../db-op').getPostsByTag;
const logger = require('../mongo-logger');

module.exports = {
    post: function (req, res, next) {
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
            //     res.sendFile('./frontEnd/archives/' + d.results[0].escapeName + '.html', {root: './'});
            // } else {
            let query = {
                escapeName: req.params['0']
            };
            getPost(query, function (d) {
                if (d.opResStr === 'success' && d.results.length) {
                    let data = d.results[0];
                    data.readCount++;
                    updatePost(data, function (d) {
                        if (d.opResStr === 'success') {
                            logger.info('router post module, update readCount success.')
                        }
                    });
                    // cachedRes.add(data);
                    res.sendFile('./frontEnd/archives/' + d.results[0].escapeName + '.html', {root: './'});
                } else {
                    next()
                }
            });

            // }

        } else {
            next()
        }
    },
    postIndex: function (req, res, next) {
        if (req.path === '/post') {
            res.sendFile('./frontEnd/html/postIndex.html', {root: './'});
        } else {
            next()
        }
    },
    abstracts: function (req, res, next) {
        let query = {
            limit: 10,
            tag: req.body.tag
        };
        getAbstracts(query, function (d) {
            if (d.opResStr === 'success') {
                res.json(d.results)
            } else {
                res.status(500).send(d)
            }
        });

    },

    blogImageUpload: function (req, res, next) {
        res.json({path: req.files[0].path.replace('/frontEnd', '')});
    },

    allTags: function (req, res, next) {
        getPostByTag('all', function (d) {
            if (d.opResStr === 'success') {
                res.json(d.results)
            } else {
                res.status(500).send(d.error || d.fault)
            }
        });
    },
    singleTag: function (req, res, next) {
        getPostByTag(req.body.tag, function (d) {
            if (d.opResStr === 'success') {
                res.json(d.results)
            } else {
                res.status(500).send(d.error || d.fault)
            }
        });
    }
};
