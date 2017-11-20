import * as fs from "fs"
import * as path from "path"
import {promisify} from "util";
import * as Router from "koa-router";
import * as Koa from "koa"
import * as r from "request"
import {logger} from "../utils";
import {deleteIndexImage, getIndexImage, saveIndexImage, updateIndexImage} from "../database";
import crawler from "../500pxCrawler"
import {DatabaseInterfaces} from "../interfaces";

const rmFile = promisify(fs.unlink);
const _request = r.defaults({encoding: null});

const likedDir = "frontEnd/img/index/liked/";
const tempDir = "frontEnd/img/index/temp/";
const router = new Router();

const downloadFile = (url: string, path: string): Promise<"done"> => {
    return new Promise((resolve, reject) => {
        _request(url, (err, res, body) => {
            if (err) return reject(err);
            fs.writeFile(path, body, e => {
                if (e) return reject(e);
                resolve("done")
            })
        })
    })
};

/**
 * 每天的定时爬取图片的任务
 * */
const cron = async (): Promise<Array<DatabaseInterfaces.indexImageDocument>> => {
    // 先爬取信息
    let crawledImages: DatabaseInterfaces.indexImage[] = await crawler();
    // 去数据库去重
    const newImages = <Array<DatabaseInterfaces.indexImageDocument>> (await Promise.all(crawledImages.map(img => saveIndexImage(img)))).filter(info => info);
    // 下载图片
    const downloadInfo: ("done" | Error) [] = await Promise.all(newImages.map(image => downloadFile(image.url, tempDir + image.id + "." + image.format)));
    // 删除下载失败的
    const succeed = <Array<DatabaseInterfaces.indexImageDocument>> downloadInfo.map((info, i) => info === "done" ? newImages[i] : undefined).filter(v => v);
    const failedIds = <Array<number>> downloadInfo.map((info, i) => info === "done" ? undefined : newImages[i].id).filter(id => id);
    await Promise.all(failedIds.map(id => deleteIndexImage(id)));
    return succeed
};

const _mvFile = (source: string, target: string) => {

    return new Promise((resolve, reject) => {
        const done = (err?: string) => {
            if (err) return reject(err);
            fs.unlink(source, function (e) {
                if (e) reject(e);
                return resolve()
            })
        };
        let targetDir = path.dirname(target);
        if (!fs.existsSync(targetDir)) {
            done(targetDir + " is not exist.")
        }

        const rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            done(err)
        });
        const wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            done(err)
        });
        wr.on("close", function () {
            done()
        });
        rd.pipe(wr)
    })
};

const getOneImg = async () => {
    let tempImages = await getIndexImage("temp");
    if (tempImages.length) {
        return tempImages[~~(Math.random() * tempImages.length)]
    } else {
        const likedImages = await getIndexImage("like");
        if (likedImages.length) {
            return likedImages[~~(Math.random() * likedImages.length)]
        } else {
            let crawledImages = await cron();
            return crawledImages[~~(Math.random() * crawledImages.length)]
        }
    }
};

const getOneImage = async (ctx: Koa.Context) => {
    const image = <DatabaseInterfaces.indexImage>(await getOneImg()).toObject({versionKey: false});
    const _path = (image.type === "temp" ? tempDir : likedDir).replace("frontEnd/", "") + image.id + "." + image.format;
    ctx.body = Object.assign({path: _path}, image)
};

const likePicture = async (ctx: Koa.Context) => {
    /**
     * 传入一个图片名称[123.jpeg]进行操作
     * @return {Boolean}
     * */
    const {imageName} = ctx.request.body;
    const {name: id} = path.parse(imageName);
    await _mvFile(tempDir + imageName, likedDir + imageName);
    let _res;
    try {
        _res = await updateIndexImage(Number(id), "like")
    } catch (e) {
        ctx.throw(400, e.message)
    }
    if (_res && _res.name) {
        ctx.body = true
    } else {
        ctx.throw(400, "Invalid image name.")
    }
};

const dislikePicture = async (ctx: Koa.Context) => {
    const imageName = ctx.query.imageName;
    const {name: id} = path.parse(imageName);
    await rmFile(tempDir + imageName);
    await updateIndexImage(Number(id), "dislike");
    ctx.body = await getOneImg()
};

router
    .get("/", getOneImage)
    .put("/", likePicture)
    .delete("/", dislikePicture);

/**
 * 开启服务器的时候先爬一次
 * */
// cron().then(() => logger.info('daily image crawled success.')).catch(e => logger.warn(e))

/**
 * 然后每天中午12点爬一次
 * */
setTimeout(function () {
    // 下面两种不确定用哪个好，先用计算都这种吧
    const someDaysNoon = 1507262400000; // 2017-10-06 12:00:00
    if ((Date.now() - someDaysNoon) % 86400000 < 1000) {
        // const _now = new Date()
        // const time = _now.getHours()+''+_now.getMinutes()+_now.getSeconds()
        // if (time === '1200'){
        cron().then(() => logger.info("daily image crawled success.")).catch(e => logger.warn(e))
    }
}, 1000);

export default router