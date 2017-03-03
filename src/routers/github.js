/**
 * Created by maic on 02/03/2017.
 */
const fs = require('fs');

const scanAndRender = require('../scanMD');
module.exports = function (req, res, next) {
    fs.writeFileSync('./github-push-data', JSON.stringify(req.body));
    console.log(req.body);
    res.json(Object.assign({}, req.body.commits.added, req.body.commits.removed, req.body.commits.modified));
    // scanAndRender(function (r) {
    //     res.json(r);
    // });
};