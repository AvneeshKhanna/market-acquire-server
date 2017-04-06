var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var dynamo_marshal = require('dynamodb-marshaler');    //package to convert plain JS/JSON objects to DynamoDB JSON
var AWS = require('aws-sdk');
var gcm = require('node-gcm');

AWS.config.region = 'ap-northeast-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:863bdfec-de0f-4e9f-8749-cf7fd96ea2ff',
});

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post('/',function(request,response,error){
    //FE will send notification set which will contain the target Audience on the basis of that SE will extract and form the data
    var dataFromAjax = JSON.parse(request.body.dataToSend);
    var targetAudience = dataFromAjax.targetAudience;
    var notificationMessage = dataFromAjax.notificationData;
    var notificationCategory = dataFromAjax.notificationCategory;
    console.log(notificationCategory);
    
    if(targetAudience == 'activitySpecific'){
        var activitySet = dataFromAjax.notificationSet;
        getActivityFcmTokens(activitySet,notificationMessage,notificationCategory,function(status){
            if(status){
                response.send(status);
                response.end();
            }
            else{
                response.send(false);
                response.end();
            }
        });
    }
    
    if(targetAudience == 'userSpecific'){
        var usersSet = dataFromAjax.notificationSet;
        var activityId = dataFromAjax.activityID;
        getUserSpecificTokens(usersSet,activityId,notificationMessage,notificationCategory,function(status){
            if(status){
                response.send(status);
                response.end();
            }
            else{
                response.send(false);
                response.end();
            }
        });
    }
    if(targetAudience == 'select'){
        getAllFcmToken(notificationCategory,notificationMessage,function(status){
            if(status){
                response.send(status);
                response.end();
            }
            else{
                response.send(false);
                response.end();
            }
        });
    }
});

function getActivityFcmTokens(activitySet,message,category,callback){
    var activitynotificationData = {
        Category : category,
        Message : message
    };
    
    var getTokenParams = {
        TableName:'UserDetails',
        AttributesToGet:['Fcm_Token'],
        ConsistentRead:true,
        ScanFilter: {
            ID: { 
                AttributeValueList: activitySet,
                ComparisonOperator: 'IN'
            },
        },
    };
    
    docClient.scan(getTokenParams,function(error,data){
        if(error){
            console.log(error);
            callback(null);
        }
        else{
            var fcmTokens = fcmTokenMapping(data.Items);
            sendNotification(fcmTokens,activitynotificationData,function(sendStatus){
                if(sendStatus){
                    callback(sendStatus);
                }
                else{
                    callback(null);
                }
            });
        }
    });
}

function getUserSpecificTokens(usersSet,activityid,message,category,callback){
     var usernotificationData = {
        Category : category,
        Message : message
    };
    
    var getTokenParams = {
        TableName:'UserDetails',
        AttributesToGet:['Fcm_Token'],
        ConsistentRead:true,
        ScanFilter: {
            ID: { 
                AttributeValueList: [activityid],
                ComparisonOperator: 'CONTAINS'
            },
            Email: {
                AttributeValueList: usersSet,
                ComparisonOperator: 'IN'
            }
        },
    };
    
    docClient.scan(getTokenParams,function(error,data){
        if(error){
            console.log(error);
            callback(null);
        }
        else{
            console.log(data);
            var fcmTokens = fcmTokenMapping(data.Items);
            console.log(fcmTokens);
            sendNotification(fcmTokens,usernotificationData,function(sendStatus){
                if(sendStatus){
                    callback(sendStatus);
                }
                else{
                    callback(null);
                }
            }); 
        }
    });
}

function getAllFcmToken(category,message,callback){
    var allUsernotificationData = {
        Category : category,
        Message : message
    };
    
    var getAllParams = {
        TableName:'UserDetails',
        AttributesToGet:['Fcm_Token'],
        ConsistentRead:true
    };
    
    docClient.scan(getAllParams,function(error,data){
        if(error){
            console.log(error);
            callback(null);
        }
        else{
            console.log(data);
            var fcmTokens = fcmTokenMapping(data.Items);
            console.log(fcmTokens);
            sendNotification(fcmTokens,allUsernotificationData,function(sendStatus){
                if(sendStatus){
                    callback(sendStatus);
                }
                else{
                    callback(null);
                }
            });
        }
    });
}

function fcmTokenMapping(serverTokens){
    var serverFcmTokens = [];
    for(var j=0;j<serverTokens.length;j++){
        if(serverTokens[j].Fcm_Token !== undefined){
            serverFcmTokens=serverFcmTokens.concat(serverTokens[j].Fcm_Token);
        }
    }
    return serverFcmTokens;
}

function sendNotification(registrationTokens , notificationData , callback){
    console.log(notificationData);
    if(registrationTokens.length == 0){
        callback(null);
    }
    else{
        var message = new gcm.Message();
        var message = new gcm.Message({
            data : notificationData
        });

        var sender = new gcm.Sender('AIzaSyDUbtCYGKI-kLl7oSVQoW_sZqo2VZBFeKQ');

        sender.send(message, { registrationTokens : registrationTokens }, 3 , function (err, response) {
            if(err){
                callback(null);
                console.log(err);
            }
            
            console.log('The notification response');
            console.log(response);
            var success = response.success;
            var failure = response.failure;
            
            var notificationResponse = {};
            notificationResponse.success = success;
            notificationResponse.failure = failure;
            callback(notificationResponse);
        }); 
    }
}

module.exports = router;