//if user does not add any value in text box of Text,Dropdown,checkbox then the form is not saved , so this is to be catered on both FE and BE

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
var activityTable = config.get('dynamoDB.activity_table');

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

router.post('/', function (request, response, error) {
    var createformData = request.body.createformData;
    console.log('The data from web----');
    console.log(JSON.stringify(createformData, null, 3));
    var bool = true;
    var activityId = createformData[0];
    var fields = createformData[1];
    var stringFields = JSON.stringify(fields);
    var editorcreate = createformData[2];

    console.log('The Activity ID is :- ' + createformData[0]);
    console.log('The Field values are :- ' + createformData[1]);
    console.log('Edit or create value is :- ' + createformData[2]);

    var keys = extractfieldKeys(fields);

    if (editorcreate == true) {
        getActivityDetails(activityId, keys, function (finalKeys) {
            putEditableDetails(finalKeys, activityId, stringFields, function (sucessfullStatus) {
                if (sucessfullStatus) {
                    response.send(bool);
                    response.end();
                }
                else {
                    response.send(error);
                    response.end();
                }
            });
        });
    }
    else {
        putActivityDetails(activityId, keys, stringFields, function (sucessfullStatus) {
            if (sucessfullStatus) {
                response.send(bool);
                response.end();
            }
            else {
                response.send(error);
                response.end();
            }
        });
    }
});

function getActivityDetails(activityid, editKeys, callback) {
    var tablekeys = [];

    var params = {
        TableName: activityTable,
        ProjectionExpression: "diff",
        Key: {
            "ID": activityid
        }
    };

    docClient.get(params, function (error, data) {
        if (error) {
            console.error(error);
            throw error;
        }

        for (var j = 0; j < data.Item.diff.length; j++) {
            tablekeys.push(data.Item.diff[j]);
        }

        var keystoStore = editkeysMapping(editKeys, tablekeys);

        callback(keystoStore);
    });
}

function putEditableDetails(finalKeys, activityid, formFields, callback) {
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
}

function editkeysMapping(clientKeys, tableKeys) {
    for (var x = 0; x < clientKeys.length; x++) {
        if (tableKeys.indexOf(clientKeys[x]) == -1) {
            tableKeys.push(clientKeys[x]);
            console.log(clientKeys[x]);
        }
    }

    return tableKeys;
}

function putActivityDetails(activityID, keys, fields, callaback) {
    var putParams = {
        TableName: activityTable,
        Item: {
            "ID": activityID,
            "diff": keys,
            "Field": fields
        },
    };

    docClient.put(putParams, function (error, data) {
        if (error) {
            callaback(null);
        }
        else {
            callaback(true);
            console.log(data);
        }
    });
}

function extractfieldKeys(field) {
    var keysName = [];

    for (var i = 0; i < field.length; i++) {
        if (field[i].type == 'Image' || field[i].type == 'Audio' || field[i].type == 'Location') {
            keysName.push(field[i].type);
            console.log(field[i].type);
        }
        else {
            keysName.push(field[i].title);
            console.log(field[i].title);
        }
    }
    return keysName;
}

module.exports = router;