/**
 * Created by avnee on 09-10-2018.
 */
'use-strict';

const express = require('express');
const router = express.Router();

const config = require('../../../app.config');
const BreakPromiseChainError = require('../../utils/BreakPromiseChainError');

let dataloadingutils = require('./DataLoadingUtils');
const consts = require('../../utils/Constants');

router.get('/', function (request, response) {

    let lastindexkey = request.query.lastindexkey ? decodeURIComponent(request.query.lastindexkey) : "";
    let type = request.query.type;  //'APPLICATION' or 'BUSINESS'

    let limit = config.isProduction() ? 25 : 15;

    let filter = {
        firstname: request.query.firstname ? decodeURIComponent(request.query.firstname) : undefined,
        lastname: request.query.lastname ? decodeURIComponent(request.query.lastname) : undefined,
        phone: request.query.phone ? decodeURIComponent(request.query.phone) : undefined,
        email: request.query.email ? decodeURIComponent(request.query.email) : undefined,
        city: request.query.city ? decodeURIComponent(request.query.city) : undefined,
        area: request.query.area ? decodeURIComponent(request.query.area) : undefined,
        state: request.query.state ? decodeURIComponent(request.query.state) : undefined,
        industry: request.query.industry ? decodeURIComponent(request.query.industry) : undefined,
        source: request.query.source ? decodeURIComponent(request.query.source) : undefined,
        address: request.query.address ? decodeURIComponent(request.query.address) : undefined
    };

    /*let specialcharregex = /[^@>()+\-*"~<]+/;   //Remove all special characters which can cause a bug in FULL TEXT SEARCH
    filter = specialcharregex.exec(filter) ? specialcharregex.exec(filter).join("") : "";    // not-null ? array.join("") : ""*/

    let connection;

    config.getNewConnection()
        .then(function (conn) {
            connection = conn;
            if(type === consts.type_data.APPLICATION){
                return dataloadingutils.loadApplicationData(connection, lastindexkey, limit, filter);
            }
            else if(type === consts.type_data.BUSINESS){
                return dataloadingutils.loadBusinessData(connection, lastindexkey, limit, filter);
            }
            else{
                throw new Error('Invalid query parameter "type"');
            }
        })
        .then(result => {
            response.send({
                data: result
            });
            response.end();
            throw new BreakPromiseChainError();
        })
        .catch(function (err) {
            config.disconnect(connection);
            if(err instanceof BreakPromiseChainError){
                //Do nothing
            }
            else{
                console.error(err);
                response.status(500).send({
                    message: 'Some error occurred at the server'
                }).end();
            }
        });

});

module.exports = router;