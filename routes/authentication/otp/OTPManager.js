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

var BreakPromiseChainError = require('../../utils/BreakPromiseChainError');

router.post('/request', function (request, response) {

    var phone_number = request.body.phone_number;
    var activity_ID = request.body.activity_ID;

    if(!phone_number || !activity_ID){
        response.status(500).send('Phone number or activity-id cannot be empty');
        response.end();
        return;
    }

    getUserDetails(phone_number)
        .then(function (item) {

            console.log("item from ddb query is " + JSON.stringify(item, null, 3));

            if(Object.keys(item).length != 0){

                if(item.Item.ID == activity_ID){
                    return sendOTP(phone_number);
                }
                else {
                    response.send({
                        details_valid: false
                    });
                    response.end();

                    throw new BreakPromiseChainError();
                }

            }
            else {
                response.send({
                    details_valid: false
                });
                response.end();

                throw new BreakPromiseChainError();
            }

        })
        .then(function (OTP) {

            response.send({
                details_valid: true,
                otp: JSON.stringify(OTP)
            });
            response.end();

        })
        .catch(function (err) {
            if(err instanceof BreakPromiseChainError){
                //Do nothing
            }
            else {
                response.status(500).send({
                    error: err.message
                }).end();

                throw err;
            }
        });
});

/**
 * Function to retrieve a user's details
 * */
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
    });
}

/**
 * Function to send an OTP to a given phone number
 * */
function sendOTP(phone_number) {
    return new Promise(function (resolve, reject) {
        var sns = new AWS.SNS();

        var params = {
            attributes : {
                DefaultSMSType : 'Transactional'
            }
        };

        sns.setSMSAttributes(params, function(err, data){

            if(err){
                reject(err);
            }
            else{

                var OTP = otpGenerator();
                var params = {

                    Message : OTP + ' - your verification code for Market Acquire',
                    PhoneNumber : '+91' + phone_number
                };

                console.log('sns request sending with otp ' + OTP);

                sns.publish(params, function(err, data){

                    if(err){
                        reject(err);
                    }
                    else{
                        /*responseObj.OTP = OTP;
                        response.send(responseObj);
                        response.end();*/
                        resolve(OTP);
                    }

                });
            }
        });
    })
}

/*
 Generates a random number between [1000, 10000)
 */
function otpGenerator(){
    return Math.floor((Math.random() * 9000) + 1000);
}


module.exports = router;