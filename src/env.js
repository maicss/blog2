const fs = require('fs');
const os = require('os');

let osName = os.type();

let DEFAULT = {
    ssl: {
        keyFile: '~/ssl/domain.key',
        certFile: '~/ssl/chained.pem',
    },
    port: {
        secure: 443,
        'non-secure': 80
    }
};

let testConfig = {
    ssl: {
        keyFile: '/Users/maic/Documents/ssl/server.key',
        certFile: '/Users/maic/Documents/ssl/server.crt',
        ca: '/Users/maic/Documents/ssl/root.crt'
    },
    port: {
        secure: 9981,
        'non-secure': 9980
    }
};


if (osName === 'Windows_NT') {
    Object.assign(testConfig, {
        ssl: {
            keyFile: 'E:\\ssl\\server.key',
            certFile: 'E:\\ssl\\server.crt',
            ca: 'E:\\ssl\\root.crt'
        }
    })
}


let env;
let credentials = {};
// if (process.argv[2] === 'test') {
if (1) {
    env = testConfig;
    credentials.ca = fs.readFileSync(env.ssl.ca);
} else {
    env = DEFAULT
}


exports.credentials = Object.assign(credentials, {
    cert: fs.readFileSync(env.ssl.certFile),
    key: fs.readFileSync(env.ssl.keyFile),
    requestCert: true,
    rejectUnauthorized: false
});
exports.ports = env.port;
