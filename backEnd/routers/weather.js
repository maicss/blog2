
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
const request = require('request-promise');

const api = new WeatherApi();


module.exports = function (req, res, next) {
    // return last cached weather by IP city address
    let ip = '';
    if (req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
        ip = Math.random() > 0.5 ? '116.246.19.150' : '112.22.233.200';
    } else if (req.ip.startsWith('::ffff:')){
        ip = req.ip.substring('::ffff:'.length)
    } else {
        throw new Error ('IP exception: ', req.ip)
    }
    request(`https://api.seniverse.com/v3/weather/daily.json?key=cqihb9cchivbqjl8&location=${ip}&start=0&days=3`)
    .then(d => {res.send(d)})
    .catch(e => {res.statusCode(500).send(e)})

};



