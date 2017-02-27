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

const routers = require('./src/routers/routers');

let bodyParser = require('body-parser');

let app = express();

app.use(compression());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

app.use(routers);

httpServer.listen(ports['non-secure']);
httpsServer.listen(ports.secure);
console.log('server on https://localhost:' + ports.secure);

/*
 * node like python single file internal test
 * if __name__ == '__main__'
 * if (require.main === module)
 * */
