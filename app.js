var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var RateLimit = require('express-rate-limit');

var index = require('./routes/index');
var users = require('./routes/manage-users/getUsers');
var edituser = require('./routes/manage-users/editUser');
var createForm = require('./routes/createForm');
var queryData = require('./routes/queryData');
var notificationSystem = require('./routes/notification-system/notification');
var activities = require('./routes/manageActivities');
//var tester = require('./routes/test');

var app = express();

var limiter = new RateLimit({
    windowMs: 60*1000, // 1 minute
    max: 25, // limit each IP to 25 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});

//apply rate-limit to all requests
app.use(limiter);


app.use(cors());
app.options('*', cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/edituser', edituser);
app.use('/createform' , createForm);
app.use('/querydata' , queryData);
app.use('/activitynotification',notificationSystem);
app.use('/activities', activities);
app.use('/otp', require('./routes/authentication/otp/OTPManager'));
app.use('/access-token', require('./routes/authentication/AccessTokenManager'));
//app.use('/test' , tester);

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
