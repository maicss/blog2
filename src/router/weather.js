
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
    let ip = req.ip === '::1' ? '116.246.19.150' : req.ip;
    let l = '';
    // todo 缓存一个IP数据库，不必每次都去线上查询了。
    api.getLocation(ip).then(function (d) {
        l = d.results[0].name;
    }, function (e) {
        console.log(e)
    }).then(function () {
        readWeather(l, function (w) {
            if (w.length) {
                res.json(w[0])
            } else {
                // 去线上查询天气，存储到数据库之后再返回
                // 这要不要做一个函数，传个参数，直接返回结果
                api.getWeather('daily', l).then(function (d) {
                    let result = d.results[0];

                    saveWeather([Object.assign({location: result.location.name}, result.daily[0], {queryTime: new Date() * 1})], function (d) {
                        console.log('weather -> saveWeather', d);
                        if(d.result.ok && d.result.n === 1) {
                            logger.info('save %s weather success', result.location.name);
                            res.json(result.daily[0]);
                        } else {
                            console.warn('router weather get a new location weather error: ', d)
                        }
                    });
                });
            }
        })
    });

};



