/**
 * Created by avnee on 16-10-2018.
 */
'use-strict';

const fs = require('fs');
const async = require('async');

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
    deleteFiles: deleteFiles
};