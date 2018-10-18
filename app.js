var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var RateLimit = require('express-rate-limit');

var appconfig = require('./app.config');

//routes
var index = require('./routes/Index');
var users = require('./routes/manage-users/GetUsers');
var edituser = require('./routes/manage-users/EditUser');
var createForm = require('./routes/CreateForm');
var queryData = require('./routes/QueryData');
var notificationSystem = require('./routes/notification-system/Notification');
var activities = require('./routes/ManageActivities');
//var tester = require('./routes/test');

var app = express();

console.log(appconfig.getEnvType() + " version is running");

const limiter = new RateLimit({
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

//data-dashboard
app.use('/data-load', require('./routes/data-dashboard/loading/DataLoadingManager'));
app.use('/data-add', require('./routes/data-dashboard/add/DataAddManager'));
app.use('/data-update', require('./routes/data-dashboard/update/DataUpdateManager'));
app.use('/data-delete', require('./routes/data-dashboard/delete/DataDeleteManager'));
app.use('/data-download', require('./routes/data-dashboard/download/DataDownloadManager'));

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
