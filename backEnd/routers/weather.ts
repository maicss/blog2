import {request} from '../utils'
import * as Koa from 'koa'
import * as Router from 'koa-router'

const router = new Router();

const weather = async (ctx:Koa.Context) => {
    let ip = '';
    if (ctx.request.ip === '::1' || ctx.request.ip === '::ffff:127.0.0.1') {
        ip = Math.random() > 0.5 ? '116.246.19.150' : '112.22.233.200'
    } else if (ctx.request.ip.startsWith('::ffff:')) {
        ip = ctx.request.ip.substring('::ffff:'.length);
        if (ip.startsWith('10.200')) {
            ip = Math.random() > 0.5 ? '116.246.19.150' : '112.22.233.200'
        }
    } else {
        throw new Error('IP exception: ' + ctx.request.ip)
    }
    const weather = await request(`https://api.seniverse.com/v3/weather/daily.json?key=cqihb9cchivbqjl8&location=${ip}&start=0&days=3`);
    ctx.body = JSON.parse(weather.toString())
};
router.get('/', weather);

export default router