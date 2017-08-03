const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

let url = 'mongodb://blog:blog%3Atest@localhost:27017/blog-test';
MongoClient.connect(url, function (err, db) {
    let col = db.collection('shuoshuo');
    col.findOne(function(e, d) {
        if (e) console.error(e);
        console.log(d);
    })
});

