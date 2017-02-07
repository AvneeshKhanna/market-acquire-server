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
    var scanData = JSON.parse(queryData);
    var data = scanData.scanData;
    var activityId = data[0].ACTIVITY_ID;
    var scandataFields = data[1].Field;
    
    var staticKeys = ['UUID','Activity_ID','City','P_EmailID','PromoterName','SaveDate','SaveTime'];
    var parentscanParams = {};
    var innerscanParams = {};
    innerscanParams.ComparisonOperator = 'CONTAINS';
    innerscanParams.AttributeValueList = [activityId];
    parentscanParams.Activity_ID = innerscanParams;
    
    for(var z=0 ; z<scandataFields.length ; z++){
        innerscanParams = {};
        innerscanParams.ComparisonOperator = scandataFields[z].comparison;
        innerscanParams.AttributeValueList = [scandataFields[z].value];
        parentscanParams[scandataFields[z].Field] = innerscanParams;
    }
    
    getActivityKeys(activityId , function(getactivitykeysStatus){
        if(getactivitykeysStatus){
            var totalKeys = staticKeys.concat(getactivitykeysStatus);
            
            scanActivityData(activityId , parentscanParams , getactivitykeysStatus , function(scandataStatus){
                if(scandataStatus){
                    scandataStatus.unshift(totalKeys);
                    response.send(JSON.stringify(scandataStatus));
                    response.end();
                }
                else{
                    response.send(false);
                    response.end();
                }
            });
        }
        else{
            response.send(false);
            response.end();
        }
    });
});

var getActivityKeys = function(activityid , callback){
    var getkeysParams = {
        TableName: "ACTIVITY_ID",
        ProjectionExpression: "diff",
        Key: {
                "ID": activityid,
        }    
    };
    
    docClient.get(getkeysParams , function(error,getKeysResult){
        if(error){
            callback(null);
        }
        else{
            callback(getKeysResult.Item.diff);
        }
    });
}

var scanActivityData = function(activityid , scanParams , totalkeys , callback){
    var scanDataParams = {
        TableName: "FormData_Test",
        AttributesToGet: ['UUID','Activity_ID','City','Data','P_EmailID','PromoterName','SaveDate','SaveTime'],
        ScanFilter: scanParams  
    };
    
    docClient.scan(scanDataParams,onScan);
    var scannedData = [];
    
    function onScan(error,scandata){
        if(error){
            callback(null);
            console.log(error);
        }
        else{
            console.log("Scan succeeded.");
            if(scandata['Items'].length != 0){
                for(var j=0 ; j<scandata['Items'].length ; j++){
                    scannedData.push(scandata.Items[j]);
                }
            }
        
            if(typeof(scandata.LastEvaluatedKey) != 'undefined'){
                console.log("Scanning for more...");
                scanDataParams.ExclusiveStartKey = scandata.LastEvaluatedKey;
                docClient.scan(scanDataParams, onScan);
            }
            if(typeof(scandata.LastEvaluatedKey) == 'undefined'){
                console.log('Final Length to Map---->>>');
                console.log(scannedData.length);
                var dataTOSend = scanDataMapping(scannedData , totalkeys);
                callback(dataTOSend);
            }
        }
    }
}

var scanDataMapping = function(scannedData , totalkeys){
    var finalDataToSend = [];
    console.log('Final Length ---->>>');
    console.log(scannedData.length);
    
    for(var i=0 ; i<scannedData.length ; i++){
        var fieldsData = [];
        fieldsData.push(scannedData[i].UUID);
        fieldsData.push(scannedData[i].Activity_ID);
        fieldsData.push(scannedData[i].City);
        fieldsData.push(scannedData[i].P_EmailID);
        fieldsData.push(scannedData[i].PromoterName);
        fieldsData.push(scannedData[i].SaveDate);
        fieldsData.push(scannedData[i].SaveTime);
        
        var dataValue = JSON.parse(scannedData[i].Data);
        var dataArray = dataFieldMapping(dataValue , totalkeys , fieldsData);
        var fieldsData = fieldsData.concat(dataArray);
        finalDataToSend.push(fieldsData);
    }
    return finalDataToSend;
}

var dataFieldMapping = function(dataValue , totalkeys , fieldsdata){
    var dataArray = []; 
    
    for(var x=0 ; x<totalkeys.length ; x++){
        if(dataValue.hasOwnProperty(totalkeys[x]) == true){
            dataArray.push(dataValue[totalkeys[x]]);
        }
        else{
            dataArray.push('N/A');
        }
    }
    
    return dataArray;
}

module.exports = router;