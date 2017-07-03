require('dotenv').config()
var express = require("express");
var app = express();
var path = require('path');

// DB
var db = require('./model/db.js');
var config = require('./model/config.js').url

// Controller - give controller access to the DB
var controller = require('./controller/index.js');

// View Engine
var ejs = require('ejs');
app.set('view engine', ejs);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index.ejs');
});

// connect to db, if successful start server
db.connect(process.env.DB_URL, function (err) {
  if (err) {
    console.log("unable to connect");
    return;
  } else {
      app.listen(process.env.PORT || 3000, function() {
        console.log("connected on port 3000");
      });
  }
})

app.get('/url/:id', function (req, res) {
  // take the user url
  let url = req.params.id;
  // run url check from controller
  controller.handleUrl(url, function (err, info) {
    if (err) {
      console.error(err, info);
      return res.redirect('/')
    }
    // successful returning json object
    return res.json(info);
  })
})

// Use render to use the template engine + fullname of file
app.get('/:id', function (req, res) {
  if (req.params.id === "favicon.ico") {
    return res.render('index.ejs');
  } else {
    // check whether id exists in db - then redirect
    controller.getId(req.params.id, function (err, data) {
      if (err) {
        console.error(err, data);
        // If url id does not exist, return to home page
        return res.redirect('/');
      } else {
        // save the ip to var and redirect
        let newUrl = data.long_url;
        // add http to ensure redirect
        return res.redirect("http://" + newUrl);
      }
    })
  }
})
