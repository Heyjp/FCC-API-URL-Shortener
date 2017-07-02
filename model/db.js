// MongoDB object, exposes connect for db connection
var Mongo = require('mongodb').MongoClient;

// var to hold the connection object
var state = {
  db: null
}

exports.connect = function (url, done) {
  if (state.db) return done();

  Mongo.connect(url, function(err, db) {
    if (err) return done(err);
    state.db = db;
    done();
  })
}

// access the db to perform actions
exports.get = function () {
  return state.db;
}

// close the db
exports.close = function (done) {
  if (state.db) {
    state.db.close(function (err, result) {
      state.db = null;
      state.mode = null;
      done(err);
    })
  }
}
