var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var boardRouter = require('./routes/board');

var app = express();

//log de redis para verificar si esta todo ok
const dbRedis = require('./db/dbRedis');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

app.use('/', indexRouter);
app.use('/board', boardRouter);

module.exports = app;