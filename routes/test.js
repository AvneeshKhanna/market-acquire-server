var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var config = require('config');

AWS.config.region = 'ap-northeast-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:863bdfec-de0f-4e9f-8749-cf7fd96ea2ff',
}); 

var formDataTable = config.get('dynamoDB.formTable');

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post('/' , function(request,response,error){
    var queryData = request.body.queryData;
    var scanData = queryData;
    var data = scanData.scanData;
    var activityId = data[0].ACTIVITY_ID;
    var scandataFields = data[1].Field;
    
    var parentscanParams = {};
    var innerscanParams = {};
    innerscanParams.ComparisonOperator = 'CONTAINS';
    innerscanParams.AttributeValueList = [activityId];
    parentscanParams.Activity_ID = innerscanParams
    
    for(var z=0 ; z<scandataFields.length ; z++){
        innerscanParams = {};
        innerscanParams.ComparisonOperator = scandataFields[z].comparison;
        innerscanParams.AttributeValueList = [scandataFields[z].value];
        parentscanParams[scandataFields[z].Field] = innerscanParams;
    }
    
    scanExecute(parentscanParams , function(resultStatus){
        if(resultStatus){
            response.send(JSON.stringify(resultStatus));
            response.end();
        }
        else{
            response.send(false);
            response.end();
        }
    });
});

var scanExecute = function(parentscanParams,callback){
    var finalItems = [];
    
    var scanParams = {
        TableName: "FormData_Test",
        AttributesToGet: ['UUID','Activity_ID','City','Data','P_EmailID','PromoterName','SaveDate','SaveTime'],
        ScanFilter: parentscanParams
    };
    
    docClient.scan(scanParams , function(error,result){
        if(error){
            callback(null);
        }
        else{
            finalItems = finalItems.concat(result.Items);
            console.log(result.Items);
            
            if(result.LastEvaluatedKey){
                scanParams.ExclusiveStartKey = result.LastEvaluatedKey;
                scanExecute(scanParams,callback); 
            }
            else{
                callback(finalItems);
            }
        }
    });
}

module.exports = router;