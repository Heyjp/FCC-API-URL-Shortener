var express = require("express");
var app = express();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
// var urlChecker = require("./shorten.js");

var theDb = "mongodb://localhost:27017/urls";

var theUrl;
var theResult;
var theNum;

app.get("/new/:id", function(req, res) { // After "/" in the url becomes a variable

 var siteParam = req.params.id;
 var theNum = Math.floor(Math.random() * 1000);

 var theTest = new RegExp(/^[0-9]{1,4}$/);

 function ValidURL(str) {
  var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  if (!re.test(str)) {
   return false;
  }
  return true
 }

 var findURL = function(db, callback) {

  if (ValidURL(siteParam) === true) {
   console.log("Insert Query is running!");
   theUrl = siteParam;

   var cursor = db.collection('urls').find({
    long_url: theUrl,
   }, {
    long_url: 1,
    short_url: 1,
    _id: 0
   });

   var shortCursor = db.collection('urls').find({
    short_url: theNum,
   }, {
    long_url: 1,
    short_url: 1,
    _id: 0
   });

   var getRandomNum = shortCursor.count(function(err, count) {
    if (count > 0) {
     theNum = Math.floor(Math.random() * 1000);
     getRandomNum();
    } else {
     return theNum;
    }
   });


   cursor.count(function(err, count) {

    if (count === 0) {
     console.log(theUrl + "was not found, inserting document to database");
     db.collection("urls").insertOne({
      long_url: theUrl,
      short_url: theNum
     }, function(err, results) {
      db.collection("urls").find({
       long_url: theUrl
      }, {
       long_url: 1,
       short_url: 1,
       _id: 0
      }).toArray(function(err, doc) {
       if (err) {
        console.error(err);
       }
       theResult = doc;
       res.send(theResult[0]);
       callback();
      });

     });

    } else if (count > 0) {
      console.log("Count is over one!!")
     cursor.toArray(function(err, doc) {
      if (err) {
       console.error(err);
      }
      theResult = doc;
      res.send(theResult);
      callback();
     });
    }
   });
 } else if (ValidURL(siteParam) === false && theTest.test(siteParam) === true) {
   console.log("NUMBERS ARE RUNNING");
   siteParam = parseInt(siteParam);
   console.log(siteParam, "this is siteParam");

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

 } else {
   res.send({
     "Url" : "Null - please enter in a new URL"
   });
   callback();
 }
 }

 mongo.connect(theDb, function(err, db) {
  if (err) {
    console.error(err);
  }
  findURL(db, function(data) {
      db.close();
  });
 });


});

app.listen("3000", function() {
 console.log("connected on port 3000");
});
