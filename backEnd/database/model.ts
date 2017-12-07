import * as mongoose from "mongoose"
import {DatabaseInterfaces} from "../interfaces";

const Schema = mongoose.Schema;

const momentsSchema = new Schema({
    date: {type: Number, required: true, unique: true, index: true},
    dateStr: String,
    "weather": {
        "text_day": {type: String, required: true},
        "code_day": {type: String, required: true},
        "text_night": {type: String, required: true},
        "code_night": {type: String, required: true},
        "high": {type: String, required: true},
        "low": {type: String, required: true},
        "location": {type: String, required: true}
    },
    "content": String,
    "images": [String],
    "isPublic": Boolean
});

const summarySchema = new Schema({
    name: {type: String, required: true, index: true, 'enum': ["summary"]},
    content: {
        all: {type: Number, required: true},
    }
}, {strict: false});

const blogSchema = new Schema({
    escapeName: {type: String, required: true, index: true, unique: true},
    originalFileName: {type: String, required: true},
    tags: {type: [String], required: true},
    date: {type: String, required: true},
    html: {type: String, required: true},
    toc: [{text: String, level: Number}],
    abstract: {type: String, required: true},
    title: {type: String, required: true},
    more: String,
    readCount: {type: Number},
    commentCount: {type: Number}
});

const blogHashSchema = new Schema({
    "originalFileName": {type: String, required: true},
    "escapeName": {type: String, required: true},
    "hash": {type: String, required: true, index: true, unique: true}
});

const userSchema = new Schema({
    "username": {type: String, required: true, unique: true},
    "password": {type: String, required: true},
    "createTime": {type: Number, required: true, unique: true}
});

const indexImageSchema: mongoose.Schema = new Schema({
    type: {type: String, required: true, "enum": ["temp", "like", "dislike"]},
    name: {type: String, required: true},
    author: {type: String, required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    id: {type: Number, unique: true, required: true, index: true},
    format: {type: String, required: true},
    url: {type: String, required: true}
}, {id: false});


type summaryDoc = DatabaseInterfaces.summary & mongoose.Document

export const momentsModel = mongoose.model<DatabaseInterfaces.momentsDocument>("moments", momentsSchema);
export const momentsSummaryModel = mongoose.model("momentsSummary", summarySchema);
export const blogModel = mongoose.model<DatabaseInterfaces.blogDocument>("blog", blogSchema);
export const blogSummaryModel = mongoose.model<summaryDoc>("blogSummary", summarySchema);
export const blogHashModel = mongoose.model<DatabaseInterfaces.blogHashDocument>("blogHash", blogHashSchema);
export const userModel = mongoose.model<DatabaseInterfaces.userDocument>("user", userSchema);
export const indexImageModel = mongoose.model<DatabaseInterfaces.indexImage>("indexImage", indexImageSchema);
