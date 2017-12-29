import * as fs from 'fs'
import * as Router from 'koa-router'
import * as Koa from "koa"

const router = new Router();

// routers
import indexImage from "./indexImage";
import user from "./user";
import moments from "./moments";
import blog from "./blog";
import weather from "./weather";
import githubHook from "./githubHook";

import {getUser} from "../database";
import {logger, saveFileFromStream} from "../utils";

const identificationCheck = async (ctx: Koa.Context, next: Function) => {
    // check identification middleware
    let isLogin = false;
    if (!ctx.cookies.get('uid')) {
        if (ctx.method === 'GET' || ctx.path === '/login' || ctx.path === '/githubHook') {
            ctx.login = isLogin;
            await next()
        } else {
            return ctx.throw(401, 'Please login and retry.')
        }
    } else {
        try {
            await getUser({createTime: Number(ctx.cookies.get("uid"))});
            ctx.login = true;
            await next()
            // todo 这里的逻辑好像不对
        } catch (e) {
            if (e.message === 'Cannot find user.') {
                if (ctx.method === 'GET' || ctx.path === '/login' || ctx.path === '/githubHook') {
                    await next()
                } else {
                    return ctx.throw(401, 'Please login and retry.')
                }
            } else {
                ctx.throw(e)
            }
        }
    }
};
const imageUploader = async (ctx: Koa.Context, next: Function) => {
    // 图片上传中间件
    const basePath = "frontEnd/img/";
    // koa2的files一直是一个对象
    ctx.request.body._files = [];
    // 注意这里的photos属性是由前端指定的，正常中间件是不依赖任何前端的关键字，在里面对每一个属性的类型进行判断再进行下一步
    if ((ctx.path === '/moments' || ctx.path === '/blog/imageUpload') && ctx.method === 'POST' && ctx.request.body && ctx.request.body.files && ctx.request.body.files.photos) {
        if (!ctx.headers.source) return ctx.throw(400, "Missing source filed in headers.");
        let files;
        if (Array.isArray(ctx.request.body.files.photos)) {
            files = ctx.request.body.files.photos
        } else {
            files = [ctx.request.body.files.photos]
        }
        ctx.request.body._files = await saveFileFromStream(files, basePath + ctx.headers.source);
        await next()
    } else {
        await next()
    }
};

router
    .post('/report-violation', async ctx => {
        if(ctx.request.body) {
            logger.info('CSP Violation: ', ctx.request.body)
        } else {
            logger.warn('CSP Violation: No data received!')
        }
        ctx.status = 204
    })
    .post('/fun', async ctx => {
        logger.info(ctx.request.body);
        ctx.body = ctx.request.body
    })
    .use(identificationCheck)
    .use(imageUploader)
    .get('/', async ctx => {
        ctx.type = "html";
        ctx.body = fs.createReadStream('frontEnd/static/index.html')
    })
    .get('/googlee2a049d23b90511c.html', async ctx => {
        ctx.type = "html";
        ctx.body = fs.createReadStream('frontEnd/static/googlee2a049d23b90511c.html')
    })
    .use('/indexImage', indexImage.routes(), indexImage.allowedMethods())
    .use('/moments', moments.routes(), moments.allowedMethods())
    .post('/login', user.routes(), user.allowedMethods())
    .post('/logout', user.routes(), user.allowedMethods())
    .use('/weather', weather.routes(), weather.allowedMethods())
    .use('/blog', blog.routes(), weather.allowedMethods())
    .post("/githubHook", githubHook);

export default router
