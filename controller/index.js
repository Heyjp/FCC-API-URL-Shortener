var shortid = require('shortid');
var db = require('../model/db.js');

var urlRegex = require('url-regex');

// Check to see if legitimate URL is passed
// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function validURL(str) {
  return urlRegex({exact: true}).test(str);
};

exports.handleUrl = function (data, callback) {

  // if url is valid run getURL or return error
    if (validURL(data)) {
      getURL(data, function (err, results) {
        if (err) {
          return callback(true, err);
        }
        // return url data to route
        return callback(null, results);
      })
    } else {
      // return an error and no data to route
      callback(true, "route not valid");
    }
}

function getURL (id, callback) {
  // point to access db from
  var collection = db.get().collection('urls');

  // Search for Url, if it does not exist create a new instance
    collection.find({
      long_url: id,
     }, {
      long_url: 1,
      short_url: 1,
      _id: 0
    }).toArray(function (err, doc) {
      // if no docs then insert new doc to db
        if (doc.length === 0) {
          // generate a unique short_url id
          var urlId = shortid.generate();

          // insert new doc to db and callback results (may need additonal query) to return data
          collection.insertOne({
           long_url: id,
           short_url: urlId
         }, function(err, res) {
              if (err) {
                return callback(true, err);
              }

              var newObj = {
                long_url: res.ops[0].long_url,
                short_url: res.ops[0].short_url
              }
              callback(null, newObj);
            }
          )
        } else {
          // long_url already exists return existing doc

              collection.find({
                long_url: id
               }, {
                long_url: 1,
                short_url: 1,
                _id: 0
              }).toArray(function(err, doc) {
                if (err) {
                 console.error(err);
                }
                callback(null, doc[0]);
             });
        }
    });
}

exports.getId = function (id, callback) {
  // point to access db from
  var collection = db.get().collection('urls');

  // search for short_url id and redirect to long_url
  collection.find({
   short_url: id,
  }, {
   long_url: 1,
   short_url: 1,
   _id: 0
 }).toArray(function (err, info) {
   // exit if err
   if (err) {
     console.error(err);
     return false;
   }
   // shortid does not exist so return false id
   if (info.length === 0) {
     return callback("This Id does not exist", false);
   } else {
      // shortid does exist, return long_url for redirect
        collection.find({
         short_url: id
        }, {
         long_url: 1,
         _id: 0
        }).toArray(function(err, doc) {
          if (err) {
            callback(err, "this is error")
          }
          // return first item in array
           callback(null, doc[0]);
        });
   }
 })
}


function insertDoc (id, urlId) {
  var collection = db.get().collection('urls');


}
