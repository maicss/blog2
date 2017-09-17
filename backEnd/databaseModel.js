const mongoose = require('mongoose')

const Schema = mongoose.Schema

const momentsSchema = new Schema({
  date: {type: Number, required: true, unique: true, index: true},
  dateStr: String,
  weather : {
    "temperature" : [String, String],
    "code" : [String, String],
    "location" : String
  },
  "content" : String,
  "images" : [String],
  "isPublic" : Boolean
})

/*
* 数据库限制数据个数
* array的子项的长度和类型
* 可有可无的，不确定key名称的，key的名称和属性限制
*
* */


const momentsSummarySchema = new Schema({
  all: {type: Number, required: true},
})

const blogSummarySchema = new Schema({
  all: {type: Number, required: true},
})

const blogSchema = new Schema({
  escapeName : {type: String, required: true, index: true, unique: true},
  originalFileName : {type: String, required:true},
  tags: {type: [String], required: true},
  date : {type: String, required:true},
  html : {type: String, required:true},
  toc: [Object],
  abstract : {type: String, required:true},
  title : {type: String, required:true},
  more: String,
  readCount : {type: Number, required:true},
  commentCount : {type: Number, required:true}
})

const blogHashSchema = new Schema({
  "originalFileName" : {type: String, required:true},
  "escapeName" : {type: String, required:true},
  "hash" : {type: String, required:true}
})


const userSchema = new Schema({
  "username" : {type: String, required:true, unique: true},
  "password" : {type: String, required:true},
  "createTime" : {type: Number, required:true, unique: true}
})


const indexImageSchema = new Schema({
  name: {type: String, required:true},
  author: {type: String, required:true},
  width: {type: Number, unique: true},
  height: {type: Number, required: true},
  id: {type: Number, unique: true, required: true, index: true},
  format: {type: String, required:true},
  url: {type: String, required:true}
})

module.exports = {
  momentsModel: mongoose.model('moments', momentsSchema, 'moments'),
  momentsSummaryModel: mongoose.model('momentsSummary', momentsSummarySchema, 'momentsSummary'),
  blogModel: mongoose.model('blog', blogSchema, 'blog'),
  blogSummaryModel: mongoose.model('blogSummary', blogSummarySchema, 'blogSummary'),
  blogHashModel: mongoose.model('blogHash', blogHashSchema, 'blogHash'),
  userModel: mongoose.model('user', userSchema, 'user'),
  indexImageModel: mongoose.model('indexImage', indexImageSchema, 'indexImage'),
}