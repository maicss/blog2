import * as fs from 'fs'
import * as path from 'path'
import * as r from 'request'
import {UploadFile} from "./interfaces";

const request = (url: string, options?:object): Promise<Buffer> => {
    let queryOptions = {
        url,
        encoding:null
    };
    if (options)queryOptions = Object.assign(queryOptions, options);
    return new Promise((res, rej) => {
        r(queryOptions, (err, resp) => {
            if (err) return rej(err);
            return res(resp.body)
        })
    })
};

const saveFileFromStream = async (fileStreamArr: UploadFile.file[], destination: string) => {
    const promisifyPipe = (fileStream: UploadFile.file) => {
        return new Promise((res, rej) => {
            const finalPath = path.join(destination, new Date().valueOf() + '-' + fileStream.name);
            const outStream = fs.createWriteStream(finalPath);
            const inStream = fs.createReadStream(fileStream.path);
            inStream.pipe(outStream);
            outStream.on('error', e => rej(e));
            inStream.on('error', e => rej(e));
            outStream.on('finish', function () {
                res({
                    rawFile: fileStream,
                    destination: destination,
                    filename: fileStream.name,
                    path: finalPath,
                    size: outStream.bytesWritten
                })
            })
        })
    };
    return await Promise.all(fileStreamArr.map(fileStream => promisifyPipe(fileStream)))
};

const shellLoggerSetting = {
    format: [
        '{{timestamp}} <{{title}}> (in {{file}}:{{line}}) {{message}}', //default format
        {
            error: '{{timestamp}} <{{title}}> (in {{file}}:{{line}}) {{message}}\nCall Stack:\n{{stack}}' // error format
        }
    ],
    dateformat: 'mm-dd HH:MM:ss'
};
const logger = require('tracer').colorConsole(shellLoggerSetting);


class ExtendableError extends Error {
    constructor(message:string) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

const buildDocumentInterface = () => {

};


export {
    logger,
    saveFileFromStream,
    ExtendableError,
    request,
};
