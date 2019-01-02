const MongoClient = require('mongodb').MongoClient;
// const ObjectID = require('mongodb').ObjectID;

function connection(closure) {
    return MongoClient.connect('mongodb://localhost:27017/my-google-one-tap', { useNewUrlParser: true },
        (err, client) => {
            if (err) return console.log(err);
            let db = client.db('my-google-one-tap');
            closure(db);
        });
};

module.exports.connection = connection;