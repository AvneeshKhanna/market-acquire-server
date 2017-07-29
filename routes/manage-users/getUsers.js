/**
 * Created by avnee on 07-04-2017.
 */
var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var config = require('config');

AWS.config.region = 'ap-northeast-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:863bdfec-de0f-4e9f-8749-cf7fd96ea2ff'
});

var usersTable = config.get('dynamoDB.users_table');
var activityTable = config.get('dynamoDB.activity_table');

var docClient = new AWS.DynamoDB.DocumentClient();

router.post('/', function (request, response) {

    var params = {
        TableName: usersTable,
        AttributesToGet: [
            'ID',
            'Email',
            'City',
            'PromoterName'
        ]
    };

    docClient.scan(params,function (err, data) {

        if(err){
            console.error(err);
            throw err;
        }
        else{

            var users =  data.Items;

            var params = {
                TableName: activityTable,
                AttributesToGet: [
                    'ID'
                ]
            };

            docClient.scan(params, function (err, aIds) {

                if(err){
                    console.error(err);
                    throw err;
                }
                else {

                    var activities = aIds.Items.map(function (element) {
                        return element.ID;
                    });

                    var res = {
                        users: users,
                        activities: activities
                    };

                    response.send(res);
                    response.end();
                }

            });

        }

    })

});

module.exports = router;