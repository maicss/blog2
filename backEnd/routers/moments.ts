import * as Router from "koa-router"
import * as Koa from "koa"
import * as path from "path"
import * as util from "util"
import {deleteMoments, getMomentsList, getMomentsSummary, saveMoments, updateMoments} from "../database"
import {DatabaseInterfaces, UploadFile} from "../interfaces";

const router = new Router();
const unlink = util.promisify(require("fs").unlink);

const marked = require("maic-marked");

const momentsList = async (ctx: Koa.Context) => {
    let condition = <DatabaseInterfaces.momentsQuery>{};
    condition.isPublic = !ctx.login;
    if (ctx.query.filter && ctx.query.filter !== "all") {
        condition.dateStr = ctx.query.filter
    }
    condition.page = Number(ctx.query.page);
    condition.limit = Number(ctx.query.limit);
    try {
        ctx.body = await getMomentsList(condition)
    } catch (e) {
        return ctx.throw(400, e.message)
    }
};

const postMoments = async (ctx: Koa.Context) => {
    let date = new Date();
    const dateStr = date.getFullYear() + "-"
        + (date.getMonth() + 1).toString().padStart(2, "0") + "-"
        + date.getDate().toString().padStart(2, "0") + " "
        + date.getHours().toString().padStart(2, "0") + ":"
        + date.getMinutes().toString().padStart(2, "0") + ":"
        + date.getSeconds().toString().padStart(2, "0");
    let body;
    try {
        body = JSON.parse(ctx.request.body.fields.moments)
    } catch (e) {
        return ctx.throw(400, "parse body json error: " + e.message)
    }
    body.isPublic = true;
    if (body.content.trim().startsWith("pre-")) {
        body.isPublic = false;
        body.content = body.content.substring(body.content.indexOf("pre-") + "pre-".length)
    }
    let content = <DatabaseInterfaces.moments>{
        date: date.valueOf(),
        dateStr,
        weather: body.weather,
        content: new marked().exec(body.content).html,
        images: [],
        isPublic: body.isPublic
    };

    ctx.request.body._files.forEach(function (v: UploadFile.file) {
        content.images.push(v.path.substring("frontEnd".length))
    });

    ctx.body = await saveMoments(content)
};

const getSummary = async (ctx: Koa.Context) => {
    return ctx.body = await getMomentsSummary()
};

const _updateMoments = async (ctx: Koa.Context) => {
    let content = new marked().exec(ctx.request.body.content).html;
    ctx.body = await updateMoments({date: ctx.request.body.date, content})
};

/**
 * 删除一个说说。先根据说说的date查找说说，然后删除说说的图片，再执行数据库删除
 *
 * */
const _deleteMoments = async (ctx: Koa.Context) => {
    let query = {date: ctx.query.date * 1};
    let moments;
    try {
        moments = await getMomentsList(query)
    } catch (e) {
        ctx.throw(400, e.message)
    }
    if (moments[0] && moments[0].images.length) {
        await Promise.all(moments[0].images.map((_path: string) => unlink(path.resolve(__dirname, "../../frontEnd" + _path))))
    }
    try {
        ctx.body = await deleteMoments(query.date)
    } catch (e) {
        if (e.message === "Invalid delete argument.") {
            return ctx.throw(400, e.message)
        }
        ctx.throw(e)
    }

};

router.get("/list", momentsList);
router.post("/", postMoments);
router.get("/summary", getSummary);
router.delete("/", _deleteMoments);
router.put("/", _updateMoments);

export default router