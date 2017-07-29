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
var docClient = new AWS.DynamoDB.DocumentClient();

router.post('/add', function (request, response) {

    var email = request.body.email;
    var activityID = request.body.activityID;
    var city = request.body.city;
    var name = request.body.promotername;

    var params = {
        TableName: usersTable,
        Key:{
            Email: email
        }
    };

    docClient.get(params, function (err, item) {

        if(err){
            console.error(err);
            throw err;
        }
        else {

            if(!item.hasOwnProperty('Item')){

                //add user's data to table
                var params = {
                    Item:{
                        Email: email,
                        ID: activityID,
                        City: city,
                        PromoterName: name
                    },
                    TableName: usersTable
                };

                docClient.put(params, function (err, data) {
                    if(err){
                        console.error(err);
                        throw err;
                    }
                    else {

                        //send back response indicating user successfully added
                        var res = {
                            status: 'OK',
                            activityID: null
                        };

                        response.send(res);
                        response.end();
                    }
                })
            }
            else {
                //send back response indicating user already exists
                var res = {
                    status: 'DUPLICATE',
                    activityID: item.Item.ID
                };

                response.send(res);
                response.end();
            }

        }

    });

});

router.post('/update', function (request, response) {

    var email = request.body.email;
    var activityID = request.body.activityID;
    var city = request.body.city;
    var name = request.body.promotername;

    var params = {
        TableName: usersTable,
        Key:{
            Email: email
        },
        ExpressionAttributeNames: {
            "#ID": "ID",
            "#C": "City",
            "#N": "PromoterName"
        },
        ExpressionAttributeValues: {
            ":id": activityID,
            ":c": city,
            ":n": name
        },
        UpdateExpression: "SET #ID = :id, #C = :c, #N = :n"
    };

    docClient.update(params, function (err, data) {
        if(err){
            console.error(err);
            throw err;
        }
        else {

            var res = {
                status: 'OK'
            };

            response.send(res);
            response.end();

        }
    })

});

module.exports = router;