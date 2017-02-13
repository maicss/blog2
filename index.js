const express = require('express');
const compression = require('compression');
const http = require('http');
const https = require('https');
// this is just add a default format to moment, because this file always load first
const moment = require('moment');
const cookieParser = require('cookie-parser');

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';


const credentials = require('./src/env').credentials;
const ports = require('./src/env').ports;
const router = {
    shuoshuo: require('./src/router/shuoshuo'),
    getWeather: require('./src/router/weather'),
    user: require('./src/router/user'),
};


let bodyParser = require('body-parser');
let multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

let upload = multer({storage: storage});

let app = express();

app.use(compression());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

app.use(function (req, res, next) {
    // let body = [];
    // req.on('data', function(chunk) {
    //     body.push(chunk);
    // }).on('end', function() {
    //     body = Buffer.concat(body).toString();
    //     console.log(body);
    //     console.log('end');
    // });
    // console.log(req.headers['user-agent']);
    if (!req.secure) {
        res.redirect('https://maicss.com' + req.path)
    } else {
        next();
        // console.log(req.method, req.path, req.params);
    }
}).get('*', function (req, res, next) {
    switch (req.path) {
        case '/index':
        case '/':
            res.status(200).sendFile(__dirname + '/public/html/index.html');
            break;
        case '/shuoshuo':
            res.status(200).sendFile(__dirname + '/public/html/shuoshuo.html');
            break;
        case '/test':
            res.status(200).sendFile(__dirname + '/public/html/test.html');
            break;
        default:
            next();
    }
})
    .post('/', upload.any(), function (req, res, next) {
        next();
    })
    .post('/getShuoshuoList', router.shuoshuo.getShuoshuoList)
    .post('/postShuoshuo', upload.any(), router.shuoshuo.postShuoshuo)
    .post('/getSummary', router.shuoshuo.getSummary)
    .post('/getWeather', router.getWeather)
    .post('/getUser', router.user.login)
    .post('/logout', router.user.logout)
    .use(express.static(__dirname + '/public'))
    .use(function (req, res) {
        res.status(404).sendFile(__dirname + '/public/html/404.html')
    });

httpServer.listen(ports['non-secure']);
httpsServer.listen(ports.secure);
console.log('server on https://localhost:' + ports.secure);

/*
 * node like python single file internal test
 * if __name__ == '__main__'
 * if (require.main === module)
 * */
