/**
 * 每天请求两次今天的天气状况存储起来
 * 前面的代码都是从thinkpage拷贝过来的
 */
const crypto = require('crypto');
const querystring = require('querystring');
const request = require('request-promise');
const moment = require('moment');
const logger = require('./mongo-logger');
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';
let URL = 'https://api.thinkpage.cn/v3/';

class Api {
    constructor() {
        this.uid = 'UA2DD92B89';
        this.secretKey = 'cqihb9cchivbqjl8';
    }

    getSignatureParams() {
        let params = {};
        params.ts = Math.floor((new Date()).getTime() / 1000); // 当前时间戳
        params.ttl = 300; // 过期时间
        params.uid = this.uid; // 用户ID

        let str = querystring.encode(params); // 构造请求字符串

        params.sig = crypto.createHmac('sha1', this.secretKey) // 使用 HMAC-SHA1 方式，以API密钥（key）对上一步生成的参数字符串进行加密
            .update(str)
            .digest('base64'); // 将加密结果用 base64 编码，并做一个 urlencode，得到签名 sig

        return params
    }

    getWeather(type, location) {
        let params = this.getSignatureParams();
        params.location = location;
        let types = ['now', 'daily'];
        if (types.indexOf(type) < 0) {
            throw new EvalError('Unknown weather type: ', type)
        }

        // 将构造的 URL 直接在后端 server 内调用
        return request({
            url: URL + `weather/${type}.json`,
            qs: params,
            json: true
        })
    }

    getLocation(ip) {
        let params = {
            q: ip,
            key: 'cqihb9cchivbqjl8'
        };
        return request({
            url: URL + 'location/search.json',
            qs: params,
            json: true
        })
    }

}

module.exports = Api;
