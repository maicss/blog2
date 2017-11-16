import * as mongoose from "mongoose"

const Schema = mongoose.Schema;

const momentsSchema = new Schema({
    date: {type: Number, required: true, unique: true, index: true},
    dateStr: String,
    "weather": {
        "date": {type: String},
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

const momentsSummarySchema = new Schema({
    name: {type: String, required: true, index: true, 'enum': ["summary"]},
    content: {
        all: {type: Number, required: true},
    }
}, {strict: false});

const blogSummarySchema = new Schema({
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

const indexImageSchema = new Schema({
    type: {type: String, required: true, "enum": ["temp", "like", "dislike"]},
    name: {type: String, required: true},
    author: {type: String, required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    id: {type: Number, unique: true, required: true, index: true},
    format: {type: String, required: true},
    url: {type: String, required: true}
});

export const momentsModel = mongoose.model("moments", momentsSchema, "moments");
export const momentsSummaryModel = mongoose.model("momentsSummary", momentsSummarySchema, "momentsSummary");
export const blogModel = mongoose.model("blog", blogSchema, "blog");
export const blogSummaryModel = mongoose.model("blogSummary", blogSummarySchema, "blogSummary");
export const blogHashModel = mongoose.model("blogHash", blogHashSchema, "blogHash");
export const userModel = mongoose.model("user", userSchema, "user");
export const indexImageModel = mongoose.model("indexImage", indexImageSchema, "indexImage");