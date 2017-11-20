import * as fs from "fs"
import * as path from "path"
import * as Router from "koa-router"
import * as Koa from "koa"
import {promisify} from "util"

const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);

const router = new Router();
import {logger} from "../utils"

import {getBlogList, updateBlogProp, getBlogSummary} from "../database";
import {DatabaseInterfaces, UploadFile} from "../interfaces";

const getBlogImageInfo = async (): Promise<{ total: number, count: number }> => {
    let total = 0;
    const base = "./frontEnd/img/blog/";
    let files = await readdir(base);
    files = files.filter(file => !file.startsWith("."));
    let count = files.length;
    let allFileStat = await Promise.all(files.map(file => lstat(path.resolve(base, file))));
    total += allFileStat.map(stat => stat.size).reduce((a, b) => a + b, 0);
    return {total, count}
};

const _getBlogList = async (ctx: Koa.Context) => {
    /**
     * 获取指定tag或指定页数的Blog列表
     *
     * */
    let condition = <DatabaseInterfaces.blogQuery>{};
    if (!ctx.query.page || !ctx.query.limit) {
        return ctx.throw(400, "Invalid blog query argument.")
    }
    condition.page = Number(ctx.query.page);
    condition.limit = Number(ctx.query.limit);
    if (ctx.query.filter && ctx.query.filter !== "all") {
        condition.tag = ctx.query.filter
    }
    ctx.body = await getBlogList(condition)
};

const _getSummary = async (ctx: Koa.Context) => {
    ctx.body = await getBlogSummary()
};

const _getBlogContent = async (ctx: Koa.Context) => {
    if (!/^[a-zA-Z-]+$/.test(ctx.params.name)) {
        return ctx.throw(400, "Invalid blog query argument.")
    }
    ctx.body = await updateBlogProp(ctx.params.name, "readCount")
};

const _blogImageUpload = async (ctx: Koa.Context) => {
    ctx.body = ctx.request.body._files.map((file: UploadFile.file) => ({
        originName: file.filename,
        path: file.path.replace("frontEnd", ""),
        size: file.size
    }))
};

const _blogImageInfo = async (ctx: Koa.Context) => {
    ctx.body = await getBlogImageInfo()
};

router.get("/list", _getBlogList);
router.get("/summary", _getSummary);
router.get("/archive/:name", _getBlogContent);
router.get("/imageInfo", _blogImageInfo);
router.post("/imageUpload", _blogImageUpload);

export default router
