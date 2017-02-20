var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var config = require('config');
var schedule = require('node-schedule');

AWS.config.region = 'ap-northeast-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:863bdfec-de0f-4e9f-8749-cf7fd96ea2ff',
}); 

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var rule = new schedule.RecurrenceRule();
rule.seconds = 50;

var j = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!');
});
