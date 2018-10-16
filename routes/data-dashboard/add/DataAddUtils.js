/**
 * Created by avnee on 15-10-2018.
 */
'use-strict';

const consts = require('../../utils/Constants');

async function insertData(connection, type, data) {
    return new Promise((resolve, reject) => {

        let sql;
        let params;

        if(type === consts.type_data.APPLICATION){
            sql = 'INSERT INTO Application SET ?';
            params = [
                data
            ];
        }
        else if(type === consts.type_data.BUSINESS){
            sql = 'INSERT INTO Business SET ?';
            params = [
                data
            ];
        }
        else{
            throw new Error('Invalid argument "type"');
        }

        connection.query(sql, params, (err, rows) => {
            if(err){
                reject(err);
            }
            else {
                resolve();
            }
        });

    });
}

async function insertDataMultiple(connection, type, data) {
    return new Promise((resolve, reject) => {

        let sql;
        let params;

        if(type === consts.type_data.APPLICATION){
            sql = 'INSERT INTO Application (' + Object.keys(data[0]).join(', ') + ') VALUES ?';
            params = [
                restructureDataForDB(data)
            ];
        }
        else if(type === consts.type_data.BUSINESS){
            sql = 'INSERT INTO Business (' + Object.keys(data[0]).join(', ') + ') VALUES ?';
            params = [
                restructureDataForDB(data)
            ];
        }
        else{
            throw new Error('Invalid argument "type"');
        }

        connection.query(sql, params, (err, rows) => {
            if(err){
                reject(err);
            }
            else {
                resolve();
            }
        });

    });
}

function restructureDataForDB(data) {

    let masterData = [];

    for (let i=0; i<data.length; i++) {

        let subArr = [];

        for (let key in data[i]) {
            subArr.push(data[i][key]);
        }

        masterData.push(subArr);
    }

    return masterData;
}

module.exports = {
    insertData: insertData,
    insertDataMultiple: insertDataMultiple
};