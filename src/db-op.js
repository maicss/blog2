const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const moment = require('moment');

let url = 'mongodb://localhost:27017/blog-test';
// todo: 线上的数据库的用户名和密码的创建和使用

/*
* 所有数据库的返回结果的格式：
* res：正确的结果，包含了需要的数据或者是个空数组
* err：查询的参数不正确之类的
* fault：能导致mongodb挂掉的操作
* */

let insertDocuments = function (collectionName, data, callback) {
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                col.insertMany(data, function (err, docs) {
                    if (err) {
                        console.log({err: err});
                    }
                    db.close();
                    callback && callback({res: docs});
                })
            } catch (e) {
                callback && callback({ fault: e })
            }
        });
    } catch (e) {
        callback && callback({ fault: e })
    }
};

let findDocuments = function (collectionName, queryObj, limit, callback) {
    try {
        MongoClient.connect(url, function (err, db) {
            let col = db.collection(collectionName);
            try {
                col.find(queryObj).limit(limit).toArray(function (err, docs) {
                    if (err) {
                        callback && callback({ err: err })
                    } else {
                        callback && callback({ res: docs })
                    }
                });
            } catch (e) {
                callback && callback({ fault: e })
            }
        });
    } catch (e) {
        callback && callback({ fault: e })
    }
};


// let now = new Date() * 1;
// let weathers = ['Rainy', 'Stormy', 'Sunny', 'Cloudy', 'Hot', 'Cold', 'Dry', 'Wet', 'Windy', 'Hurricanes', 'typhoons', 'Sand-storms', 'Snow-storms', 'Tornados', 'Humid', 'Foggy', 'Snow', 'Thundersnow', 'Hail', 'Sleet', 'drought', 'wildfire', 'blizzard', 'avalanche', 'Mist'];
//
// let sb = [];
//
// let strs = 'From the gutters of the right lobe, that hefty plum muscle with veins installed like threads of a stubborn sweater, from the base of that small croissant, wet, lodged between ribs nine and eleven, from the gaps between colonic crypts, the end curves of test tube walls, from the capsule tissue of each gluey node along collarbones, from the crooked pulp of every shifting tooth, from the pulsating straw soaked with saliva and food, from the innermost coat of jelly-filled holes, animating color images of a visual world, from a pair of whitish pills tethered to elastic curbs, from the vocal butterfly stationed in the neck, from the bump of each bud behind every bitter bite, from the bed beneath plates of nails served on twisted fingertips, from the delicate film of each sac, sipping oxygen, from the snail swirl fixed in echoing channels, from the tapered rim of a bile-storing pear, from the visceral zone of a pyramid piece atop filtering seeds, from the secret ribbons of thick yellow from heel to toe, from the crowded tail of a sugar manager, from the fourth membrane of bowed upper lip, and from every pore and pit and crack and cave; never just from the bottom of my heart, but from the root of spongy marrow, the gentle dip of each red blood cell leaping, the sweaty pocket of every follicle, and even where there are no grooves or turns, no soft nook or fibrous layers, no valley of vessels, just the shapeless light still connected to my body —  the rise of affection, for you, the tender core of love’s beginning — I mean from the endless ends of my soul; from there, too Mehrnoosh was born and raised in New York. Her poetry has appeared in The Missing Slate, Passages North, HEArt Journal Online, Chiron Review, and is forthcoming in Natural Bridge, Painted Bride Quarterly, and Pinch Journal. She is a 2016 Best of the Net nominee. Mehrnoosh currently lives in New York and practices matrimonial law.'.split(' ').map(function (a) {
//     return a.replace(/[;,.!]/)
// });
// let imgs = ['../img/chun.jpg', '../img/deng1.jpg', '../img/girl.jpg', '../img/heart.jpeg', '../img/icemonten.jpg', '../img/iceriver.jpg', '../img/icetree.jpg', '../img/icetree1.jpg', '../img/snow.jpg', '../img/snow1.jpg', '../img/snow2.jpg'];
//
// for (let i = 0; i < 500; i++) {
//     let img = [];
//     // 每次减20到70小时，生成300条数据
//     now -= (Math.floor(Math.random() * 50 + 20) * 3567 * 1000);
//     let start = Math.floor(Math.random() * strs.length);
//     let imgCount = Math.floor(Math.random() * 3);
//     for (let a = 0; a <= imgCount; a++) {
//         img.push(imgs[Math.floor(Math.random() * imgs.length)])
//     }
//     sb.push({
//         date: now,
//         dateStr: moment(now).format('YYYY-MM-DD HH:mm:ss'),
//         weather: weathers[Math.floor(Math.random() * weathers.length)],
//         // 从一个已知范围内随机出来一个10-20个连续单词长度的"一句话"
//         content: strs.slice(start, start + Math.floor(Math.random() * 10 + 20)).join(' '),
//         img,
//         location: '',
//         isPublic: Math.random() < 0.9
//     })
//
// }

module.exports = {

    saveWeather: function (data, callback) {
        insertDocuments('weather', data, callback)
    },

    readWeather: function (location, callback) {
        findDocuments('weather', { location }, 1, function (d) {
            callback(d.res);
        });
    },

    getShuoshuoList: function (condition, callback) {
        let queryObj = {};
        for (let a in condition) {
            switch (a) {
                case 'time':
                    queryObj = Object.assign(queryObj, { date: { $lt: Number(condition.time) } });
                    break;
                case 'isPublic':
                    queryObj = condition.isPublic ? Object.assign(queryObj, { isPublic: true }) : queryObj;
                    break;
            }
        }
        findDocuments('shuoshuo', queryObj, Number(condition.limit), callback);
    },

    saveOneShuoshuo: function (data, callback) {
        console.log(data);
    },

    findLog: function (level, date, callback) {
        findDocuments('blogLog', date, callback)
    },

    saveLog: function (level, date, callback) {
        insertDocuments('blogLog', date, callback)
    },

    updateShuoshuoSumary: function () {

    },

    getShuoshuoSumary: function () {

    }
};
