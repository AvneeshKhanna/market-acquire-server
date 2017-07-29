/**
 * Created by avnee on 28-07-2017.
 */

var jwt = require('jsonwebtoken');
var globalconfig = require('../../globalconfig');

function createToken(key) {
    return jwt.sign(key, globalconfig.secretkey)
}

module.exports = {
    createNewToken: createToken
};