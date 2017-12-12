var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var poem = require('./routes/poem');
var signup = require('./routes/signup');
var login = require('./routes/login');
var maltest = require('./routes/maltest');
var logout = require('./routes/logout');
var search = require('./routes/search');
var anime = require('./routes/anime');
var mongoose = require('mongoose');


mongoose.connect('mongodb://:@ds133876.mlab.com:33876/node', { useMongoClient: true});
var db = mongoose.connection;

var app = express();

// view engine setup
app.set('views', path.join(__dirname,'/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'something',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}));

app.use(express.static(path.join(__dirname, '/public')));
app.use(function(req, res, next) {
    if(req.session.UserID)
    res.locals.UserID = req.session.UserID;
    res.locals.FlashMessage = req.session.FlashMessage;
    delete req.session.FlashMessage;
    next();
});

app.use('/', index);
app.use('/poem', poem);
app.use('/signup', signup);
app.use('/login', login);
app.use('/mal', maltest);
app.use('/logout', logout);
app.use('/search', search);
app.use('/anime', anime);
// app.use(customErrorHandler);

// function customErrorHandler(err, req, res, next){
//     if(err.message === 'User Exists') {
//         var data = {messages: "username exists", statuses: "400"};
//         res.render('error1', data);
//     }
//     if(err.message === 'Signup error'){
//         var data = {messages: "There was a problem in signing up! please try again later", statuses: "500"};
//         res.render('error1', data);
//     }
//     if(err.message === '220' || err.message === '215'){
//         var data = {messages: "there was a problem in authenticating the user", statuses: "225"}
//         res.render('error1', data);
//     }
//     else next(err);
//
// }


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
