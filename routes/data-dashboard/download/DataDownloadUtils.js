/**
 * Created by avnee on 16-10-2018.
 */
'use-strict';

const json2csvparser = require('json2csv').Parser;
const fs = require('fs');
const path = require('path');

const consts = require('../../utils/Constants');

const users_csv_dir = path.join(__dirname, '../../../docs/');
const users_csv_file = 'Users.csv';
const users_csv_path = users_csv_dir + users_csv_file;

async function downloadApplicationData(connection, filter) {

    let where_clauses = [];

    let no_filter_condition = true;

    for (let key in filter) {
        if(filter[key] !== undefined){

            no_filter_condition = false;

            switch(key) {
                case 'firstname':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'lastname':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'phone':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'email':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'city':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'area':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'state':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'industry':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'source':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'served':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                default:
                    throw new Error('Invalid filter key');
            }
        }
    }

    if(no_filter_condition){   //Case where no filter condition is specified
        where_clauses.push('1=1');
    }

    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Application ' +
            'WHERE ' + where_clauses.join(' AND '), [], (err, rows, columns) => {
            if(err){
                reject(err);
            }
            else{
                resolve({
                    rows: rows,
                    columns: columns
                });
            }
        });

    });
}

async function downloadBusinessData(connection, filter) {

    let where_clauses = [];

    let no_filter_condition = true;

    for (let key in filter) {
        if(filter[key] !== undefined){

            no_filter_condition = false;

            switch(key) {
                case 'businessname':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'contactpersonname':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'designation':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'pincode':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'address':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'phone':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'email':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'city':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'state':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                case 'industry':
                    where_clauses.push(createWhereClause(key, JSON.stringify(filter[key])));
                    break;
                default:
                    throw new Error('Invalid filter key');
            }
        }
    }

    if(no_filter_condition){   //Case where no filter condition is specified
        where_clauses.push('1=1');
    }

    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Business ' +
            'WHERE ' + where_clauses.join(' AND '), [], (err, rows, columns) => {
            if(err){
                reject(err);
            }
            else{
                resolve({
                    rows: rows,
                    columns: columns
                });
            }
        });

    });
}

function createWhereClause(key, value){
    return 'MATCH(' + key + ') AGAINST (' + value + ' IN BOOLEAN MODE)';
}

async function downloadSelectedData(connection, type, type_ids) {
    return new Promise((resolve, reject) => {

        let sql;

        if(type === consts.type_data.APPLICATION){
            sql = 'SELECT * FROM Application WHERE aid IN (?)';
        }
        else if(type === consts.type_data.BUSINESS){
            sql = 'SELECT * FROM Business WHERE bid IN (?)';
        }
        else{
            throw new Error('Invalid argument "type"');
        }

        connection.query(sql, [type_ids], (err, rows, columns) => {
            if(err){
                reject(err);
            }
            else{
                resolve({
                    rows: rows,
                    columns: columns
                });
            }
        });
    });
}

async function saveDataToFile(columns, rows){
    return new Promise((resolve, reject) => {

        const fields = columns.map(function (col) {
            return col.name;
        });

        const json2csv = new json2csvparser(fields);
        let csv_data = json2csv.parse(rows);

        fs.writeFile(users_csv_path, csv_data, function (err) {
            if(err){
                reject(err);
            }
            else{
                resolve({
                    users_csv_path: users_csv_path,
                    users_csv_file: users_csv_file
                });
            }
        });
    });
}

module.exports = {
    downloadApplicationData: downloadApplicationData,
    downloadBusinessData: downloadBusinessData,
    downloadSelectedData: downloadSelectedData,
    saveDataToFile: saveDataToFile
};