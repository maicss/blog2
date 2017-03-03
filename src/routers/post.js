/**
 * Created by maic on 01/03/2017.
 */
const getPosts = require('../db-op').getPosts;

module.exports = function (req, res, next) {
    console.log(req.params['0']);

    console.log(req.tsl);
    // 做个缓存试试
    let cachedRes = [];
    let pathReg = /^[\u4e00-\u9fa5\w-]+[^ /]$/;
    if (pathReg.test(req.params['0'])) {
        let query = {
            escapeName: req.params['0']
        };
        getPosts(query, function (d) {
            if (d.opResStr === 'success') {
                res.sendFile('./public/archives/' + d.results[0].escapeName + '.html', {root: './'});
            } else {
                res.status(404).send('NOT FOUND.')
            }
        });
    } else {
        res.status(400).send('aaa')
    }
    // getPostInfo({escapeName: });
};
