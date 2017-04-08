/**
 * Created by avnee on 06-04-2017.
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

var formDataTable = config.get('dynamoDB.formTable');
var usersTable = 'UserDetails';
var activityTable = 'ACTIVITY_ID';

var docClient = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post('/', function(request, response) {

   var params = {
       TableName: activityTable,
       AttributesToGet: ['ID', 'Field']
   };

   docClient.scan(params, function (err, activities) {

     if(err){
         console.error(err);
         throw err;
     }
     else {

         var params = {
             TableName: usersTable
         };

         docClient.scan(params, function (err, users) {

             if(err){
                 console.error(err);
                 throw err;
             }
             else {

                 for (var i=0; i<activities.Items.length; i++){

                    var activity = activities.Items[i];

                    if(activity.hasOwnProperty('Field')){
                        activity.Field = JSON.parse(activity.Field);
                    }

                    var activityUsers = users.Items.filter(mapActivityToUser(activity.ID));
                    activity.activityUsers = activityUsers;

                    activity = replaceProperty(activity, 'ID', 'activityid');
                    activity = replaceProperty(activity, 'Field', 'activityForm');

                    activities.Items[i] = activity;
                 }

                 response.send(activities.Items);
                 response.end();

             }

         });

     }

   })

});

/*
* Function to return the object if the 'activityID' parameter matches the calling object's own 'ID' property. This function is to be
* used in conjunction with 'Array.prototype.filter()' method
* */
function mapActivityToUser(activityID){

    return function(element) {
        if(element.ID == activityID){

            element = replaceProperty(element, 'PromoterName', 'name');
            element = replaceProperty(element, 'Email', 'emailId');
            element = replaceProperty(element, 'City', 'city');

            delete element.ID;  //Deleting this property as it would be redundant in the master object

            return element;
        }
    }

}

/*
* Method to change an object's property name
*
* Note: Parameters 'from' and 'to' should be of the type string
* */
function replaceProperty(object, from, to){

    object[to] = {};
    object[to] = object[from];
    delete object[from];

    return object;
}

module.exports = router;