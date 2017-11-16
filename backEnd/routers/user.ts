/**
 * Created by maic on 12/02/2017.
 */
import * as Router from 'koa-router'
import * as Koa from 'koa'
const router = new Router();

import {getUser} from '../database'

const login = async (ctx:Koa.Context) => {
    const {username, password, rememberMe} = ctx.request.body;
    if (!username || !password) {
        ctx.throw(400)
    }
    let dbUser;
    try {
        dbUser = await getUser({username})
    } catch (e) {
        return ctx.throw(401, 'Invalid username or password')
    }
    if (dbUser.length && dbUser[0].password === password) {
        if (rememberMe === true) {
            // cookie encrypt
            // let salt = 'naive';
            // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
            // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
            // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
            let maxAge = 10 * 24 * 60 * 60 * 1000; // 10d
            ctx.cookies.set('uid', dbUser[0].createTime, {maxAge, httpOnly: true, secure: true});
            ctx.cookies.set('login', 'bingo', {maxAge, httpOnly: false, secure: true});
        } else {
            ctx.cookies.set('uid', dbUser[0].createTime, {httpOnly: true, secure: true});
            ctx.cookies.set('login', 'bingo', {httpOnly: false, secure: true});
        }
        ctx.status = 200
    } else {
        return ctx.throw(401, 'Invalid username or password', {username, password})
    }
};

const logout = function (ctx:Koa.Context) {
    ctx.cookies.set('uid', '');
    ctx.cookies.set('login', '');
    ctx.status = 200
};

router.post('/login', login);
router.post('/logout', logout);

export default router
