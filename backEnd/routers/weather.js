
// this is get weather from api directly
// for limit request times, stored data in database
// const weatherApi = require('../store-weather');
//
// module.exports = {
//     getWeather: function (req, res, next) {
//         let ip = req.ip === '::1' ? '116.246.19.150' : req.ip;
//         // test 的IP先设置为公司的IP
//         weatherApi.getWeather('daily', ip).then(function (d) {
//             res.json(Object.assign({location: d.results[0].location.name}, d.results[0].daily[0]))
//         }, function (e) {
//             res.status(500).send(e)
//         })
//     }
// };

const WeatherApi = require('../store-weather');
const logger = require('../mongo-logger');
const readWeather = require('../db-op').readWeather;
const saveWeather = require('../db-op').saveWeather;

const api = new WeatherApi();


module.exports = function (req, res, next) {
    // return last cached weather by IP city address
    let ip = '';
    if (req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
        ip = Math.random() > 0.9 ? '116.246.19.150' : '112.22.233.200';
    } else if (req.ip.startsWith('::ffff:')){
        ip = req.ip.substring('::ffff:'.length)
    } else {
        throw new Error ('IP exception: ', req.ip)
    }
    let l = '';
    // todo 缓存一个IP数据库，不必每次都去线上查询了。
    api.getLocation(ip).then(function (d) {
        l = d.results[0].name;
        if (!l) {
            logger.warn('Didn\'t get location info');
            // todo: terminate this promise
        }

    }).then(function () {
        if (l === '' && process.platform === 'darwin') {
            // todo: 本地测试没网络链接的时候即使有缓存天气信息，但是由于location为空也查询不到。这样写太局限了。
            l = '上海'
        }
        readWeather(l, function (d) {
            if (d.opResStr === 'success' && d.results.length) {
                res.json(d.results[0]);
            } else {
                // 去线上查询天气，存储到数据库之后再返回
                // 这要不要做一个函数，传个参数，直接返回结果
                api.getWeather('daily', l).then(function (d) {
                    let result = d.results[0];

                    saveWeather([Object.assign({location: result.location.name}, result.daily[0], {queryTime: new Date() * 1})], function (d) {
                        switch (d.opResStr) {
                            case 'success':
                                if (d.results.result.ok === 1 && d.results.result.n === 1) {
                                    res.json(d.results.ops[0]);
                                    logger.info('save %s weather success', result.location.name);
                                }
                                break;
                            case 'error':
                                logger.warn('router weather error when get a new location: ', d.results[0]);
                                res.status(400).send(d.results[0]);
                                break;
                            case 'fault':
                                logger.error('router weather fault when get a new location: ', d.results[0]);
                                res.status(500).send(d.results[0]);
                                break;
                        }
                    });
                }).catch(function (err) {
                    res.status(500).send(err);
                });
            }
        })
    });

};



