var express = require('express');
var wechat = require('wechat');
var path = require('path');
var app = express();
var ejs = require('ejs');
ejs.open = '{{';
ejs.close = '}}';

var mongoose = require('mongoose');
var wechat = require('./src/wechat');
var settings = require('./settings');
mongoose.connect(settings.mongodbUrl);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.__express);
app.use('/public', express.static(path.join(__dirname, 'assets')));
app.use('/wechat', express.query(), wechat(settings.wechatToken, settings.calendarUrl));
app.get('/', function(req, res) {
  res.render('index.ejs');
});
app.use('/api/v1', require('./src/api.js'));
app.listen(settings.port);
