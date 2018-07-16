/**
 * Created by avnee on 16-07-2018.
 */
'use-strict';

var config = require('config');

var consts = require('./routes/utils/Constants');

function getEnvType() {
    return config.get("type");
}

function isProduction() {
    return getEnvType() === consts.ENV_TYPE_PROD;
}

module.exports = {
    getEnvType: getEnvType,
    isProduction: isProduction,
    secretkey: '5d852a5a-72c9-4943-a2a9-4ca178dda3bd'
};