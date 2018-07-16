/**
 * Created by avnee on 28-07-2017.
 */

var jwt = require('jsonwebtoken');
var appconfig = require('../../app.config');

function createToken(key) {
    return jwt.sign(key, appconfig.secretkey)
}

module.exports = {
    createNewToken: createToken
};