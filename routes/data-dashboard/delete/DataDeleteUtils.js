/**
 * Created by avnee on 15-10-2018.
 */
'use-strict';

const consts = require('../../utils/Constants');

async function deleteData(connection, type, type_id) {
    return new Promise((resolve, reject) => {
        let sql;
        let params;

        if(type === consts.type_data.APPLICATION){
            sql = 'DELETE FROM Application WHERE aid = ?';
            params = [
                type_id
            ];
        }
        else if(type === consts.type_data.BUSINESS){
            sql = 'DELETE FROM Business WHERE bid = ?';
            params = [
                type_id
            ];
        }
        else{
            throw new Error('Invalid argument "type"');
        }

        connection.query(sql, params, (err, rows) => {
            if(err){
                reject(err);
            }
            else{
                resolve();
            }
        });

    });
}

async function deleteSelectedData(connection, type, type_ids) {
    return new Promise((resolve, reject) => {
        let sql;
        let params;

        if(type === consts.type_data.APPLICATION){
            sql = 'DELETE FROM Application WHERE aid IN (?)';
            params = [
                type_ids
            ];
        }
        else if(type === consts.type_data.BUSINESS){
            sql = 'DELETE FROM Business WHERE bid IN (?)';
            params = [
                type_ids
            ];
        }
        else{
            throw new Error('Invalid argument "type"');
        }

        connection.query(sql, params, (err, rows) => {
            if(err){
                reject(err);
            }
            else{
                resolve();
            }
        });

    });
}

module.exports = {
    deleteData: deleteData,
    deleteSelectedData: deleteSelectedData
};