const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const moment = require('moment');
const logger = require('./mongo-logger');

const url = require('../env').mongoConfig.url;


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
    // console.log('queryObj: ', queryObj);
    // todo: 这里的参数设计不好，queryObj和options可以设置为默认参数，放到最后面
    options.limit = options.limit || 0;
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                col.find(queryObj, {'_id': 0}).sort(options.sort).limit(options.limit).toArray(function (err, docs) {
                    if (err) {
                        callback && callback({opResStr: 'fault', results: [{name: err.name, message: err.message}]})
                    } else {
                        callback && callback({opResStr: 'success', results: docs});
                        db.close();
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

const updateDocument = function (collectionName, query, newData, callback, options) {
    let updateSet = {
        returnNewDocument: true,
        upsert: options && options.upsert
    };

    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                // 这个还不会写过滤规则，先查询出来全部的，然后用js过滤好了
                // col.findAndModify()
                col.findOneAndUpdate(query, {$set: newData}, updateSet, function (err, doc) {
                    if (err) {
                        // todo 这里的错误结构可能不是这样的，但是mongodb文档里没找到错误的文档
                        callback && callback({opResStr: 'error', results: [{name: err.name, message: err.message}]})
                    } else {
                        callback && callback({opResStr: 'success', results: doc});
                        db.close();
                    }
                });

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
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection('shuoshuo');
            try {
                col.findOne({name: 'summary'}, function (err, doc) {
                    if (err) {
                        logger.error('updateShuoshuoSummary find summary document error', err)
                    } else {
                        let summary = {};
                        if (doc === null) {
                            // summary not exists, rebuild summary
                            rebuildSummary()
                        } else {
                            summary = doc.summary;
                            summary.all++;
                            let year = dateStr.substring(0, 4);
                            if (summary[year]) {
                                summary[year]++;
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
//
// const rebuildSummary = function (callback) {
//     let summary = {all: 0};
//     try {
//         MongoClient.connect(url, function (err, db) {
//             let col = db.collection('shuoshuo');
//             try {
//                 col.find().toArray(function (err, docs) {
//                     if (err) {
//                         logger.error('updateShuoshuoSummary no summary, findAll documents error: ', err)
//                     } else {
//                         docs.forEach(v => {
//                             summary.all++;
//                             let year = v.dateStr.substring(0, 4);
//                             if (summary[year]) {
//                                 summary[year]++;
//                             } else {
//                                 summary[year] = 1;
//                             }
//                         });
//                         col.insertOne({name: 'summary', summary}, function (err, r) {
//                             if (err) {
//                                 logger.error('updateShuoshuoSummary rebuild summary insert into col failed: ', err)
//                             } else {
//                                 if (r.insertedCount === 1) {
//                                     logger.info('updateShuoshuoSummary rebuild summary and insert success.')
//                                 }
//                             }
//                         });
//                         callback && callback(summary)
//                     }
//                 })
//             } catch (e) {
//                 logger.error('rebuild summary fault: ', e)
//             }
//         })
//     } catch (e) {
//         logger.error('rebuild summary connect to db fault: ', e)
//     }
// };

// let now = new Date() * 1;
//
// let sb = [];
//
// const fs = require('fs');
//
// let strs = fs.readFileSync('../songci.txt').toString().split('。');
//
// function randomBetween(low, high) {
//     return Math.floor(Math.random() * (high - low) + low)
// }
//
// let len = strs.length;
// for (let i = 0; i < 1000; i++) {
//     // 每次减20到70小时，生成300条数据
//     now -= (Math.floor(Math.random() * 50 + 20) * 3567 * 1000);
//     let start = Math.floor(Math.random() * len);
//     let temperatureLow = randomBetween(-5, 40);
//     let temperatureHigh = randomBetween(temperatureLow, (temperatureLow + 10 > 40 ? 40 : temperatureLow + 10));
//     // -5 ~ 40
//     let codeLow = randomBetween(0, 38);
//     let codeHigh = randomBetween(codeLow, (codeLow + 20 > 38 ? 38 : codeLow + 20));
//
//     sb.push({
//         date: now,
//         dateStr: moment(now).format('YYYY-MM-DD HH:mm:ss'),
//         weather: {
//             location: Math.random() > 0.8 ? '上海' : '苏州',
//             temperature: [temperatureLow, temperatureHigh],
//             code: [codeLow , codeHigh]
//         },
//         // 从一个已知范围内随机出来一个10-20个连续单词长度的"一句话"
//         content: strs.slice(start, start + Math.floor(Math.random() * 3 + 2)).join('。'),
//         images: [],
//         isPublic: Math.random() < 0.95
//     });
// }
// insertDocuments('shuoshuo', sb, function (d) {
//     console.log(d)
// });

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
                case 'timeMark':
                    queryObj = Object.assign(queryObj, {date: {$lt: Number(condition.timeMark)}});
                    break;
                case 'isPublic':
                    queryObj = condition.isPublic ? Object.assign(queryObj, {isPublic: true}) : queryObj;
                    break;
                case 'dateStr':
                    queryObj.dateStr = condition.dateStr;
                case 'content':
                    queryObj = condition.content ? Object.assign(queryObj, {content: {$exists: true}}) : queryObj;
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
            if (d.results.length === 0) {
                rebuildSummary(function (summary) {
                    d.results.push({summary});
                    callback && callback(d);
                });
            } else {
                callback && callback(d);
            }
        })
    },

    getUser: function (username, callback) {
        findDocuments('user', username, {}, function (d) {
            callback && callback(d)
        })
    },

    savePostsSha: function (data) {
        updateDocument('postssha', {originalFileName: data.originalFileName}, data, function (d) {
            if (d.opResStr === 'success') {
                logger.info('update/insert post[%s] sha success.', data.originalFileName)
            } else {
                logger.error('update/insert post[%s] sha failed.', data.originalFileName)
            }
        }, {upsert: true})
    },
    getPostsSha: function (callback) {
        findDocuments('postssha', {}, {}, callback)
    },

    savePostInfo: function (data, callback) {
        insertDocuments('posts', [data], callback);

    },

    updatePostInfo: function (data, callback) {
        updateDocument('posts', {originalFileName: data.originalFileName}, data, callback);
    },

    getPosts: function (post, callback) {
        findDocuments('posts', post, {}, callback)
    },

    getAbstracts: function (callback) {
        findDocuments('posts', {}, {limit: 10, sort:{createDate: -1}}, callback)
    },
};

// let update = function () {
//     MongoClient.connect(url, function (err, db) {
//         let col = db.collection('shuoshuo');
//         let summary = {all: 0};
//         col.find({date: {$exists: 1}}).toArray(function (err, docs) {
//             if (err) console.error(err);
//             docs.forEach(function (v) {
//                 console.log(v);
//                 let year = v.dateStr.substring(0, 4);
//                 summary.all ++;
//                 if (summary[year]) {
//                     summary[year] ++;
//                 } else {
//                     summary[year] = 1;
//                 }
//             });
//             col.findOneAndUpdate({name: 'summary'}, {$set: {name: 'summary', summary}}, function (err, c) {
//                 if (err) console.error(err);
//                 console.log(c)
//             })
//         });
//     })
// };
//
// update();