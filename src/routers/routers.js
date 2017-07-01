/**
 * Created by maic on 17/02/2017.
 */

const express = require('express');
const router = express.Router();
const path = require('path');


let multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let path = './public/img/';
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
        // let body = [];
        // req.on('data', function(chunk) {
        //     body.push(chunk);
        // }).on('end', function() {
        //     body = Buffer.concat(body).toString();
        //     console.log(body);
        //     console.log('end');
        // });
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
                res.status(200).sendFile('/public/html/index.html', {root: './'});
                break;
            case '/shuoshuo':
                res.status(200).sendFile('/public/html/shuoshuo.html', {root: './'});
                break;
            case '/test':
                res.status(200).sendFile('/public/html/test.html', {root: './'});
                break;
            default:
                next();
        }
    })
    .get('/post/*', routerList.posts.post)
    .get('/post', routerList.posts.postIndex)

    .post('/getTagPosts', routerList.posts.singleTag)
    .post('/getPostsAbstract', routerList.posts.abstracts)
    .post('/blogImageUpload', upload.any(), routerList.posts.blogImageUpload)
    .post('/getPostAllTags', routerList.posts.allTags)

    .post('/github', routerList.github)

    .post('/getShuoshuoList', routerList.shuoshuo.getShuoshuoList)
    .post('/postShuoshuo', upload.any(), routerList.shuoshuo.postShuoshuo)
    .post('/getSummary', routerList.shuoshuo.getSummary)

    .post('/getWeather', routerList.getWeather)

    .post('/getUser', routerList.user.login)
    .post('/logout', routerList.user.logout)
    .use(express.static(path.resolve('./public')))
    .use(function (req, res) {
        res.status(404).sendFile('/public/html/404.html', {root: './'})
    });

module.exports = router;


