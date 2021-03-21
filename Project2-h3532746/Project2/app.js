var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// session
var bodyParser = require('body-parser');
var sessions = require('express-session');

var indexRouter = require('./routes/index');

//Database
var db = require('mongoose');
db.connect('mongodb://localhost:27017/as2', (err) => {
  if (err)
    console.log("MongoDB connection error: "+err);
  else
console.log("Connected to MongoDB");
});

//Set the Schema
var filmSchema = new db.Schema({
  _id: db.Schema.Types.ObjectId,
  filmid: Number,
  filmname: String,
  duration: String,
  category: String,
  language: String,
  director: String,
  description: String
});

var commentSchema = new db.Schema({
  commentid: Number,
  filmid: Number,
  userid: String,
  comment: String
});

var broadcastSchema = new db.Schema({
  broadcastid: Number,
  filmid: String,
  date: String,
  time: String,
  houseid: String,
  day: String,
  houserow: Number,
  housecol: Number
});

var ticketSchema = new db.Schema({
  userid: String,
  ticketid: Number,
  broadcastid: Number,
  seatno: String,
  tickettype: String,
  ticketfee: Number
});

var loginSchema = new db.Schema({
  userid: String,
  pw: String,
});

//Create my models
var Film = db.model('Film', filmSchema);
var Comment1 = db.model('Comment', commentSchema);
var BroadCast = db.model('BroadCast', broadcastSchema);
var Ticket = db.model('Ticket', ticketSchema);
var Login = db.model('Login', loginSchema);

var app = express();

// Session
app.use(bodyParser.urlencoded({extended:true}));
app.use(sessions({
  secret: 'secret', resave: false, saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our model accessible to routers 
app.use(function(req,res,next) {
  req.film = Film;
  req.comment = Comment1;
  req.broadcast = BroadCast;
  req.ticket = Ticket;
  req.login = Login;
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
