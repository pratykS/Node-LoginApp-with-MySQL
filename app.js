/**
 * Module dependencies.
 */

var express = require('express'),
  api = require('./routes/api'),
  token = require('./routes/token.js'),
  mysql = require('mysql'),
  fs = require('fs');

var passport = require('passport');
var flash = require('connect-flash');



// Database

var pool = mysql.createPool({
  host: "sql3.freemysqlhosting.net",
  port: 3306,
  user: "sql346494",
  password: "rG3*xB7!",
  database: "sql346494"
});

var app = module.exports = express();

// Configuration

app.configure(function () {
  app.set('port', process.env.PORT || 2000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});


var schedule = require('node-schedule');

var j = schedule.scheduleJob('23 * * * *', function () {
  token.tokenDelete(pool);
});

function checkAuth(req, res, next) {
  var tokenid = req.get('Authorization');
  console.log("TOKEN ID : " + tokenid);
  var errorfun = function () {
    res.send({
      message: "User is not Authenticated"
    }, 401);
    res.end();
  };
  var successfun = function () {
    next();
  };

  token.tokenOne(pool, tokenid, errorfun, successfun);
}


// route to homepage
app.get('/', function (req, res) {
  res.render('index.ejs'); // load the index.ejs file
});


app.post('/login', api.userLogin(pool));

app.get('/login', function (req, res) {
  res.render('login.ejs', {
    message: req.flash('loginMessage')
  });
});

app.get('/api/users', checkAuth, api.users(pool));

app.get('/signup', function (req, res) {

  // render the page and pass in any flash data if it exists
  res.render('signup.ejs');
});

app.post('/signup', api.usersAdd(pool));

app.get('/profile', checkAuth, function (req, res) {
  res.render('profile.ejs');
});

app.get('/logout', function (req, res) {
  res.redirect('/');
});
appServer = app.listen(2000, function () {
  console.log("Express server listening on port %d in %s mode", appServer.address().port, app.settings.env);

});