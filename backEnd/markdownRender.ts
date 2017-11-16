/**
 * Created by maic on 28/02/2017.
 */
import * as fs from "fs"
import * as util from "util"
import * as crypto from "crypto"
import * as path from "path"
import {DatabaseInterfaces, MarkdownRender} from "./interfaces";
import {getBlogHash, saveBlog, saveBlogHash} from "./database";
import {logger} from "./utils";
import {MD_DIR} from "../env";

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);
const readFile = util.promisify(fs.readFile);
const marked = require("maic-marked");

const ALGORITHM = "sha256";
const fileNameRegExp = /[\u4e00-\u9fa5\w()（） -]+\.md/;

interface FileInfo {
    originalFileName: string,
    escapeName: string,
    hash: string,
    isNewFile: boolean,
}

const singleRender = async (fileInfo: FileInfo): Promise<MarkdownRender.renderRes> => {
    let fileName = fileInfo.originalFileName + ".md";
    let filePath = path.resolve(__dirname, MD_DIR, fileName);
    let fileStat = await lstat(filePath);
    if (fileStat.isFile()) {
        const MDContent = await readFile(filePath);
        return new marked().exec(MDContent.toString());
    } else {
        throw new TypeError(fileInfo.originalFileName + "is not a file.")
    }
};

const getAllMarkdownHash = async (): Promise<Array<FileInfo>> => {
    const fileInfos: FileInfo[] = [];
    let files = await readdir(path.resolve(__dirname, MD_DIR));
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (!fileNameRegExp.test(file)) {
            throw Error(file + " not match given format")
        }
        let filename = path.parse(file).name;
        let fileAbsPath = path.resolve(__dirname, MD_DIR, file);
        const sha = crypto.createHash(ALGORITHM);
        const content = await readFile(fileAbsPath);
        fileInfos.push({
            originalFileName: filename,
            escapeName: filename.replace(/[ _]/g, "-"),
            hash: sha.update(content).digest("hex"),
            isNewFile: true,
        })
    }
    return fileInfos
};

const renderAll = async (forceRender?: boolean) => {
    /**
     * forceRender: 是否忽略数据库信息强制渲染所有文件
     * */
    try {
        const filesInfo = await getAllMarkdownHash();
        const filesInfoCopy = [...filesInfo];
        let DBFilesInfoCopy: DatabaseInterfaces.blogHash[] = [];
        if (!forceRender) {
            const DBFilesInfo = await getBlogHash();
            DBFilesInfoCopy = [...DBFilesInfo];

            // 比对本地文件和数据库的hash
            filesInfo.forEach((fileInfo) => {
                DBFilesInfo.forEach((dbInfo: DatabaseInterfaces.blogHash) => {
                    if (fileInfo.escapeName === dbInfo.escapeName) {
                        DBFilesInfoCopy.splice(DBFilesInfoCopy.indexOf(dbInfo), 1);
                        fileInfo.isNewFile = false;
                        if (fileInfo.hash === dbInfo.hash) {
                            filesInfoCopy.splice(filesInfoCopy.indexOf(fileInfo), 1)
                        }
                    }
                })
            })
        }

        const needRenderFileCount = filesInfoCopy.length;
        if (needRenderFileCount) {
            for (let i = 0; i < needRenderFileCount; i++) {
                let renderResult = await singleRender(filesInfoCopy[i]);
                let blogInfo = <DatabaseInterfaces.blog>{};

                blogInfo.originalFileName = filesInfoCopy[i].originalFileName;
                blogInfo.escapeName = filesInfoCopy[i].escapeName;
                blogInfo.isPublic = true;
                // private parse
                if (renderResult.title.startsWith("pre-")) {
                    blogInfo.isPublic = false;
                    renderResult.title = renderResult.title.substring("pre-".length)
                }
                blogInfo = Object.assign(blogInfo, renderResult);
                if (filesInfoCopy[i].isNewFile) {
                    blogInfo.readCount = 0;
                    blogInfo.commentCount = 0
                }
                delete filesInfoCopy[i].isNewFile;
                await saveBlog(blogInfo);
                await saveBlogHash(filesInfoCopy[i])
            }
        } else {
            logger.info("no new file");
            return "no new file"
        }

        if (DBFilesInfoCopy.length) {
            // 正常情况下，本地文件的信息应该是大于等于数据库的信息
            logger.warn("hash in database is redundancy", DBFilesInfoCopy);
            return 'hash in database is redundancy'
        }
        logger.info(`${filesInfoCopy.map(i => i.originalFileName)} success`);
        return 'render md success'
    } catch (e) {
        logger.error(e)
    }
};

export default renderAll;
