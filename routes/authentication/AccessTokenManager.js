/**
 * Created by avnee on 28-07-2017.
 */

var express = require('express');
var app = express();
var router = express.Router();

var AWS = require('aws-sdk');
var config = require('config');

AWS.config.region = 'ap-northeast-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:863bdfec-de0f-4e9f-8749-cf7fd96ea2ff'
});

var usersTable = config.get('dynamoDB.users_table');
var docClient = new AWS.DynamoDB.DocumentClient();

var _auth = require('./TokenUtils');

router.post('/create', function (request, response) {

    var phone_number = request.body.phone_number;
    var fcm_token = request.body.fcm_token;



});

function getUserDetails(phone_number) {
    return new Promise(function (resolve, reject) {
        var params = {
            TableName: usersTable,
            Key:{
                Email: phone_number
            }
        };

        docClient.get(params, function (err, item) {
            if(err){
                reject(err);
            }
            else{
                resolve(item);
            }
        });
    })
}

function updateUserDetails(user, activity_ID) {
    return new Promise(function (resolve, reject) {
        var editParams = {
            TableName: activityTable,
            Key: {
                "ID": activityid
            },
            AttributeUpdates: {
                diff: {
                    Action: 'PUT',
                    Value: finalKeys
                },
                Field: {
                    Action: 'PUT',
                    Value: formFields
                }
            }
        };

        docClient.update(editParams, function (error, data) {
            if (error) {
                callback(null);
            }
            else {
                callback(true);
                console.log(data);
            }
        });
    });
}

module.exports = router;