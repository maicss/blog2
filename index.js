const express = require('express');
const compression = require('compression');
const http = require('http');
const https = require('https');
// this is just add a default format to moment, because this file always load first
const moment = require('moment');

moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';


const credentials = require('./src/env').credentials;
const ports = require('./src/env').ports;
const router = {
    getShuoshuoList: require('./src/router/get-shuoshuo-list').getShuoshuoList,
    postShuoshuo: require('./src/router/post-shuoshuo').postShuoshuo,
    getWeather: require('./src/router/weather'),
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

let upload = multer({ storage: storage });

let app = express();

app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

app.use('*', function (req, res, next) {
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
}).post('/', upload.any(), function (req, res, next) {
    // todo rawBody
    // console.log(req.file);
    // var body = [];
    // req.on('data', function(chunk) {
    //     body.push(chunk);
    // }).on('end', function() {
    //     body = Buffer.concat(body).toString();
    //     console.log('end');
    //     res.status(200).send('request body: ', body);
    // });
    next();
})
    .post('/getShuoshuoList', router.getShuoshuoList)
    .post('/postShuoshuo',upload.any(), router.postShuoshuo)
    .post('/getWeather', router.getWeather)
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
