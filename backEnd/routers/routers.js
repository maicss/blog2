/**
 * Created by maic on 17/02/2017.
 */

const express = require('express');
const router = express.Router();
const path = require('path');


let multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let path = './fontEnd/img/';
        cb(null, path + (req.headers.source || 'shuoshuo'))
    },
    filename: function (req, file, cb) {
        cb(null, new Date() * 1 + '-' + file.originalname)
    }
});


let upload = multer({storage: storage});

const routerList = {
    shuoshuo: require('./shuoshuo'),
    getWeather: require('./weather'),
    user: require('./user'),
    posts: require('./posts'),
    github: require('./github'),
};

router
    .use(function (req, res, next) {
        if (!req.secure) {
            res.redirect('https://maicss.com' + req.path)
        } else {
            next();
        }
    })
    .get('*', function (req, res, next) {
        switch (req.path) {
            case '/index':
            case '/':
                res.status(200).sendFile('/frontEnd/html/index.html', {root: './'});
                break;
            case '/shuoshuo':
                res.status(200).sendFile('/frontEnd/html/shuoshuo.html', {root: './'});
                break;
            case '/test':
                res.status(200).sendFile('/frontEnd/html/test.html', {root: './'});
                break;
            case '/googlee2a049d23b90511c.html':
                res.sendFile('/frontEnd/html/googlee2a049d23b90511c.html', {root: './'});
                break;
            default:
                next();
        }
    })
    .get('/post/*', routerList.posts.post)
    .get('/post', routerList.posts.postIndex)

    .get('/getTagPosts', routerList.posts.singleTag)
    .post('/getPostsAbstract', routerList.posts.abstracts)
    .post('/blogImageUpload', upload.any(), routerList.posts.blogImageUpload)
    .get('/getPostAllTags', routerList.posts.allTags)

    .post('/github', routerList.github)

    .get('/getShuoshuoList', routerList.shuoshuo.getShuoshuoList)
    .post('/postShuoshuo', upload.any(), routerList.shuoshuo.postShuoshuo)
    .get('/getSummary', routerList.shuoshuo.getSummary)

    .get('/getWeather', routerList.getWeather)

    .post('/login', routerList.user.login)
    .post('/logout', routerList.user.logout)
    .use(express.static(path.resolve('./frontEnd')))
    .use(function (req, res) {
        res.status(404).sendFile('/frontEnd/html/404.html', {root: './'})
    });

module.exports = router;


