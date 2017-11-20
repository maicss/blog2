/**
 * Created by maic on 02/03/2017.
 */

import scanAndRender from "../markdownRender"
import * as childProcess from "child_process";
import * as Koa from 'koa'

const exec = childProcess.exec;

const _pull = async () => {
    return new Promise((res, rej) => {
        exec("git pull", (err, stdout) => {
            if (err) return rej(err);
            if (stdout.trim() === "Already up-to-date.") {
                res("Already up-to-date.")
            } else {
                res("something new");
            }

        })
    })
};

export default async (ctx: Koa.Context) => {
    const r = await _pull();
    if (r === "something new") {
        ctx.body = await scanAndRender()
    } else {
        ctx.body = "Already up-to-date."
    }
};