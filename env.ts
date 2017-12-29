import * as fs from 'fs'
import * as path from 'path'

const MD_DIR = path.resolve(__dirname, './frontEnd/markdowns/');

let url = 'mongodb://localhost:27017/blog-test';

const ssl = {
    keyFile: "../../ssl/server.key",
    certFile: "../../ssl/server.crt"
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
const env: string = "dev";

export {
    credentials,
    ports,
    url as mongoUrl,
    MD_DIR,
    env,
};