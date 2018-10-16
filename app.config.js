/**
 * Created by avnee on 16-07-2018.
 */
'use-strict';

const config = require('config');
const mysql = require('mysql');

const dbConfig = config.get('rdsDB.dbConfig');

const consts = require('./routes/utils/Constants');

function getEnvType() {
    return config.get("type");
}

function isProduction() {
    return getEnvType() === consts.ENV_TYPE_PROD;
}

const connectionPool = mysql.createPool({
    connectionLimit: 50,
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    timezone: 'UTC',
    port: dbConfig.port,
    multipleStatements: true,   //To run multiple queries within the same connection callback loop
    charset: 'utf8mb4_unicode_ci'
});

function getNewConnection() {
    return new Promise(function (resolve, reject) {
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            }
            else {
                resolve(connection);
            }
        });
    });
}

function disconnect(connection) {
    if (connection && connection.state !== "disconnected") {
        console.log('connection released');
        connection.release();
    }
}

module.exports = {
    getEnvType: getEnvType,
    isProduction: isProduction,
    getNewConnection: getNewConnection,
    disconnect: disconnect,
    secretkey: '5d852a5a-72c9-4943-a2a9-4ca178dda3bd'
};