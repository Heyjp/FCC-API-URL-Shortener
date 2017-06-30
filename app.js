var express = require("express");
var app = express();
var path = require('path');

// DB
var mongo = require('mongodb').MongoClient;
var config = require('./model/config.js').url


// Controller
// var urlChecker = require('./controller/index.js')

// View Engine
var ejs = require('ejs');
app.set('view engine', ejs);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index.ejs');
})

// Use render to use the template engine + fullname of file
app.get('/:id', function (req, res) {
  if (!req.params.id) {
    res.render('index.ejs');
  } else {
    // do something
    res.send("hello")
  }
})

app.get('/url/:id', function (req, res) {
  let data = req.params.id;
  urlChecker.check(data, function (err, info) {
    if (err) {
      console.log(err);
      res.redirect('/')
    }
    res.json(info);
  })
})

app.listen(3000, function() {
 console.log("connected on port 3000");
});
