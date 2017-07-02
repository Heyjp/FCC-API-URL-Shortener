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

function getURL (data, callback) {

  // point to access db from
  var collection = db.get().collection('urls');

  // Search for Url, if it does not exist create a new instance
    collection.find({
      long_url: data.id,
     }, {
      long_url: 1,
      short_url: 1,
      _id: 0
    }).toArray(function (err, count) {
      console.log(count, "this is count");
      // if no docs then insert new doc to db
        if (count.length === 0) {
          console.log("count is 0");
          // generate new short_url id
          let urlId = shortid.generate();
          /*
          // insert new doc to db and callback results (may need additonal query) to return data
          db.insertOne({
           long_url: theUrl,
           short_url: urlId
          }, function(err, results) {
              if (err) {
                return err;
              }
              // return newly inserted doc data
              callback(null, results);
            }
          )
          */
        } else {
          // long_url already exists return existing doc
            console.log("Count is over one!!")
            /*
              db.find({
                long_url: data.url,
               }, {
                long_url: 1,
                short_url: 1,
                _id: 0
              }).toArray(function(err, doc) {
                if (err) {
                 console.error(err);
                }
                callback();
             });
            */
        }
    });
}

exports.getId = function (data, callback) {
  console.log(getId, "getId is running")
  // point to access db from
  var collection = db.get().collection('urls');

  // search for short_url id and redirect to long_url
  collection.find({
   short_url: data.id,
  }, {
   long_url: 1,
   short_url: 1,
   _id: 0
 }).count(function (err, count) {
   // exit if err
   if (err) {
     console.error(err);
     return false;
   }
   // shortid does not exist so return false id
   if (count === 0) {
     console.log(count, "count = 0;");
     return false;
   }

   // shortid does exist, return long_url for redirect
   console.log(count, "count > 0");
   /*
     var cursor1 = db.collection('urls').find({
      short_url: siteParam
     }, {
      long_url: 1,
      _id: 0
     });

     cursor1.toArray(function(err, doc) {
      theResult = doc[0]["long_url"];
      res.redirect("http://" + theResult);
      callback();
     });
   */
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
