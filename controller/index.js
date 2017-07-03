var shortid = require('shortid');
var db = require('../model/db.js');

// Make sure the shortened URL is correct
let shortUrlTest = new RegExp(/^[0-9]{1,4}$/);

// Check to see if legitimate URL is passed
function ValidURL(str) {
 var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
 if (!re.test(str)) {
  return false;
 }
 return true
}

function getURL (id, callback) {
  console.log(id, "this is data from getUrl")
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
      console.log(doc, "this is doc");
      // if no docs then insert new doc to db
        if (doc.length === 0) {
          console.log("count is 0");
          // generate new short_url id
          let urlId = shortid.generate();

          // insert new doc to db and callback results (may need additonal query) to return data
          collection.insertOne({
           long_url: id,
           short_url: urlId
         }, function(err, doc) {
              if (err) {
                return callback(true, err);
              }

              let newObj = {
                long_url: doc.ops[0].long_url,
                short_url: doc.ops[0].short_url
              }
              // return newly inserted doc data
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
           callback(null, doc[0]);
        });
   }
 })
}

exports.handleUrl = function (data, callback) {

  // if url is valid run getURL or return error
    if (ValidURL(data)) {
      getURL(data, function (err, data) {
        if (err) {
          console.log(err);
        }
        // return url data to route
        return callback(data);
      })
    } else {
      // return an error and no data to route
      callback(true, null);
    }
}
