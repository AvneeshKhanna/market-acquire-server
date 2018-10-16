/**
 * Created by avnee on 15-10-2018.
 */
'use-strict';

const consts = require('../../utils/Constants');

async function updateData(connection, type, type_id, data) {
    return new Promise((resolve, reject) => {

        let sql;
        let params;

        if(type === consts.type_data.APPLICATION){
            sql = 'UPDATE Application SET ? WHERE aid = ?';
            params = [
                data,
                type_id
            ];
        }
        else if(type === consts.type_data.BUSINESS){
            sql = 'UPDATE Business SET ? WHERE bid = ?';
            params = [
                data,
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

module.exports = {
    updateData: updateData
};