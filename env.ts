import * as fs from 'fs'
import * as path from 'path'
// big-mac admin auth [admin, maicss+1s]

const MD_DIR = path.resolve(__dirname, './frontEnd/markdowns/');

let url = 'mongodb://localhost:27017/blog-test';

const ssl = {
    keyFile: '../../Documents/ssl/server.key',
    certFile: '../../Documents/ssl/server.crt'
};
const ports = {
    secure: 9981,
    'non-secure': 9980
};

const credentials = {
    cert: fs.readFileSync(ssl.certFile),
    key: fs.readFileSync(ssl.keyFile),
    requestCert: false,
    rejectUnauthorized: false
};

export {
    credentials,
    ports,
    url as mongoUrl,
    MD_DIR,
};