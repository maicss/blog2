const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const moment = require('moment');
const logger = require('./mongo-logger');

let url = 'mongodb://localhost:27017/blog-test';
// todo: 线上的数据库的用户名和密码的创建和使用

/*
 * 所有数据库的返回结果的格式：
 * res：正确的结果，包含了需要的数据或者是个空数组
 * err：查询的参数不正确之类的
 * fault：能导致mongodb挂掉的操作
 * */

const insertDocuments = function (collectionName, data, callback) {
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                col.insertMany(data, function (err, docs) {
                    if (err) {
                        callback && callback({opResStr: 'error', results: [{name: err.name, message: err.message}]});
                    } else {
                        callback && callback({opResStr: 'success', results: docs});
                    }
                    db.close();
                })
            } catch (e) {
                callback && callback({opResStr: 'fault', results: [{name: err.name, message: err.message}]})
            }
        });
    } catch (e) {
        callback && callback({opResStr: 'fault', results: [{name: e.name, message: e.message}]})
    }
};

const findDocuments = function (collectionName, queryObj, options, callback) {
    options.limit = options.limit || 1;
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                col.find(queryObj).sort(options.sort).limit(options.limit).toArray(function (err, docs) {
                    if (err) {
                        callback && callback({opResStr: 'fault', results: [{name: err.name, message: err.message}]})
                    } else {
                        callback && callback({opResStr: 'success', results: docs});
                    }
                });
            } catch (e) {
                callback && callback({opResStr: 'fault', results: [{name: e.name, message: e.message}]})
            }
        });
    } catch (e) {
        callback && callback({opResStr: 'fault', results: [{name: e.name, message: e.message}]})
    }
};

const updateDocuments = function (collectionName, query, newData, callback) {
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                // 这个还不会写过滤规则，先查询出来全部的，然后用js过滤好了
                // col.findAndModify()
                col.find({}).toArray(function (err, docs) {
                    docs.forEach(v => {
                        let aa = v;
                        if (aa.images && aa.images.length) {
                            aa.images.forEach((bb, i) => {
                                if (bb.startsWith('public')) {
                                    aa.images[i] = bb.substring('public'.length);
                                    col.findOneAndUpdate({_id: aa._id}, {$set: aa}, function (err, r) {
                                        // 这里返回为空的时候意味着没有匹配项，这样返回400类错误
                                        // 默认返回r.upsertedCount
                                        console.log(r)
                                    })
                                }
                            });
                        }
                    })
                })

            } catch (e) {
                console.error(e);
                // callback && callback({opResStr: 'fault', results: [{name: e.name, message: e.message}]});
            }
        })
    } catch (e) {
        console.error(e);
        // callback && callback({opResStr: 'fault', results: [{name: e.name, message: e.message}]});
    }
};

const updateShuoshuoSummary = function (dateStr) {
    try{
        MongoClient.connect(url, function (err, db) {
            let col = db.collection('shuoshuo');
            try {
                col.findOne({name: 'summary'}, function (err, doc) {
                    if (err) {
                        logger.error('updateShuoshuoSummary find summary document error', err)
                    } else {
                        let summary = doc.summary;
                        summary.all ++;
                        let year = dateStr.substring(0, 4);
                        if (summary[year]) {
                            summary[year] ++;
                        } else {
                            summary[year] = 1;
                        }
                        col.updateOne({_id: doc._id}, {$set: {summary}}, function (err, r) {
                            if (err) {
                                logger.error('updateShuoshuoSummary update summary document error', err)
                            } else {
                                if (r.upsertedCount === 1) {
                                    logger.info('updateShuoshuoSummary update summary document success')
                                }
                            }
                            db.close();
                        });
                    }
                });
            } catch (e) {
                logger.error('updateShuoshuoSummary find summary fault', e)
            }
        })
    } catch (e) {
        logger.error('updateShuoshuoSummary connect db fault', e)
    }
};


let now = new Date() * 1;

let sb = [];

const fs = require('fs');

let strs = fs.readFileSync('../songci.txt').toString().split('。');

let len = strs.length;
for (let i = 0; i < 500; i++) {
    // 每次减20到70小时，生成300条数据
    now -= (Math.floor(Math.random() * 50 + 20) * 3567 * 1000);
    let start = Math.floor(Math.random() * len);
    let temperatureLow = Math.random();
    sb.push({
        date: now,
        dateStr: moment(now).format('YYYY-MM-DD HH:mm:ss'),
        weather: {
            temperature: [],
            code: []
        },
        // 从一个已知范围内随机出来一个10-20个连续单词长度的"一句话"
        content: strs.slice(start, start + Math.floor(Math.random() * 10 + 20)).join(' '),
        location: strs[Math.floor(Math.random() * len)],
        images: [],
        isPublic: Math.random() < 0.95
    })

}

module.exports = {

    saveWeather: function (data, callback) {
        insertDocuments('weather', data, callback)
    },

    readWeather: function (location, callback) {
        findDocuments('weather', {location, date: moment().format('YYYY-MM-DD')}, {limit: 1}, function (d) {
            callback && callback(d);
        });
    },

    getShuoshuoList: function (condition, callback) {
        let queryObj = {};
        let options = {sort: {'date': -1}, limit: Number(condition.limit)};
        for (let a in condition) {
            switch (a) {
                case 'time':
                    queryObj = Object.assign(queryObj, {date: {$lt: Number(condition.time)}});
                    break;
                case 'isPublic':
                    queryObj = condition.isPublic ? Object.assign(queryObj, {isPublic: true}) : queryObj;
                    break;
            }
        }
        findDocuments('shuoshuo', queryObj, options, callback);
    },

    saveOneShuoshuo: function (data, callback) {
        insertDocuments('shuoshuo', [data], function (d) {
            updateShuoshuoSummary(data.dateStr);
            callback && callback(d);
        });
    },

    findLog: function (level, date, callback) {
        findDocuments('blogLog', date, callback)
    },

    saveLog: function (level, date, callback) {
        insertDocuments('blogLog', date, callback)
    },

    getShuoshuoSummary: function (callback) {
        findDocuments('shuoshuo', {name: 'summary'}, {}, function (d) {
            callback && callback(d)
        })
    }
};
