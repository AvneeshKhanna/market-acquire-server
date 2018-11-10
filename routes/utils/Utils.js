/**
 * Created by avnee on 16-10-2018.
 */
'use-strict';

const fs = require('fs');
const async = require('async');

/**
 * Resets the region and identity-pool-id for AWS to EU_WEST_1
 * */
function setAWSConfigForSES(AWS) {
    AWS.config.region = 'eu-west-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-west-1:d29fce0a-ac1a-4aaf-b3f6-0bc48b58b87e'
    });
}

/**
 * Resets the region and identity-pool-id for AWS to AP_NORTHEAST_1
 * */
function resetAWSConfig(AWS) {
    AWS.config.region = 'ap-northeast-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-northeast-1:863bdfec-de0f-4e9f-8749-cf7fd96ea2ff'
    });
}

async function deleteFiles(files) {
    return new Promise((resolve, reject) => {
        async.each(files, (file, callback) => {

            fs.unlink(file, err => {
                if (err) {
                    callback(err);
                }
                else {
                    callback();
                }
            });

        }, err => {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                console.log('Files Deleted');
                resolve();
            }
        });
    });
}

module.exports = {
    deleteFiles: deleteFiles,
    setAWSConfigForSES: setAWSConfigForSES,
    resetAWSConfig: resetAWSConfig
};