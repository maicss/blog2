import mongoose = require("mongoose");

export namespace MarkdownRender {
    export interface renderRes {
        date: string,
        toc: {
            level: number,
            text: string
        }[],
        html: string,
        tags: string[],
        more?: string,
        title: string,
        abstract: string,
    }
}

export namespace UploadFile {
    export interface file extends File {
        path: string
    }
}

export namespace DatabaseInterfaces {
    export interface userQuery {
        username?: string,
        createTime?: number
    }

    export interface momentsQuery {
        limit?: number,
        page?: number,
        date?: number,
        isPublic?: boolean,
        dateStr?: string
    }

    export interface moments {
        weather: {
            code_day: string,
            code_night: string,
            high: string,
            low: string,
            location: string,
            text_day: string,
            text_night: string
        },
        content: string,
        date: number,
        dateStr: string,
        images: string[],
        isPublic: boolean
    }

    export interface momentsDocument extends moments, mongoose.Document {
    }

    export interface updateMoments {
        date: number,
        content: string
    }

    export interface summary {
        all: number,

        [tag: string]: number
    }

    // export interface summaryDocument extends summary, mongoose.Document {}

    export interface blog extends MarkdownRender.renderRes {
        escapeName: string,
        commentCount: number,
        readCount: number,
        originalFileName: string,
        isPublic?: boolean
    }

    export interface blogDocument extends blog, mongoose.Document {
    }

    export interface blogQuery {
        limit: number,
        page: number,
        tag?: string,
        isPublic?: boolean
    }

    export interface blogHash {
        hash: string,
        escapeName: string,
        originalFileName: string
    }

    export interface blogHashDocument extends blogHash, mongoose.Document {
    }

    export interface indexImage {
        name: string,
        author: string,
        width: number,
        height: number,
        id: number,
        format: string,
        url: string,
        type: "dislike" | "like" | "temp",
    }

    export interface indexImageDocument extends mongoose.Document {
    }

    // todo 這裏所有的document都可以使用裝飾器實現
}
