import * as http from "http"
import * as fs from "fs"
import * as Koa from "koa"
import * as spdy from "spdy"

import * as bodyParser from "koa-body"
import * as helmet from "koa-helmet"
import * as compress from "koa-compress"
import * as  staticServer from "koa-static";

const onerror = require("koa-onerror");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import router from "./backEnd/routers";
import {ports, credentials, env} from "./env";
const spdyOption = {
    key: credentials.key,
    // cert: credentials.chain,
    cert: credentials.cert,
    spdy: {
        // todo 這裏刪除了 protocols 不知道會fallback到什麼地方
        plain: false,
        "x-forwarded-for": true,
        connection: {
            windowSize: 1024 * 1024, // Server's window size
            autoSpdy31: true
        }
    }
};

class KoaOnHttps extends Koa {
    constructor() {
        super()
    }

    listen(...args: any[]) {
        const server = spdy.createServer(spdyOption, this.callback());
        return server.listen.apply(server, args)
  }
}

const app = new KoaOnHttps();
app.use((ctx, next) => {
    if (!ctx.secure && ctx.method === "GET") {
        return ctx.redirect("https://" + ctx.hostname + ":" + ports.secure + ctx.path)
    }
    return next()
});
// const app = new Koa()
app.use(bodyParser({multipart: true}));
// app.use(koaLogger())
if (env === "product") {
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self', 'https://www.google-analytics.com', 'https://api.github.com', 'https://www.googletagmanager.com', 'https://pagead2.googlesyndication.com'"]
        }
    }))
}
app.use(compress());
onerror(app);

// x-response-time

app.use(async function (ctx, next) {
    const start = new Date().valueOf();
    await next();
    const ms = new Date().valueOf() - start;
    ctx.set("X-Response-Time", `${ms}ms`)
});
app.use(staticServer("frontEnd", {maxage: 8640000}));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (ctx, next) => {
    await next();
    if (ctx.method === "GET") {
        // 所有的其他请求都交给vue的404处理
        ctx.type = "html";
        ctx.body = fs.createReadStream("frontEnd/index.html")
    } else {
        ctx.throw(404, "Not Found")
    }

});

if (!module.parent) {
    app.listen(ports.secure);
    http.createServer(app.callback()).listen(ports["non-secure"])
}

// app.on('error', err => console.log(err))
console.log("server on https://localhost:" + ports.secure);

export default app