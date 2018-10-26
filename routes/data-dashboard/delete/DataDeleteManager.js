/**
 * Created by avnee on 15-10-2018.
 */
'use-strict';

const express = require('express');
const router = express.Router();

const config = require('../../../app.config');
const BreakPromiseChainError = require('../../utils/BreakPromiseChainError');

const datadeleteutils = require('./DataDeleteUtils');
const consts = require('../../utils/Constants');

router.post('/', (request, response) => {
    let type = request.body.type;  //'APPLICATION' or 'BUSINESS'
    let type_id = request.body.type_id;

    let connection;

    config.getNewConnection()
        .then(conn => {
            connection = conn;
            return datadeleteutils.deleteData(connection, type, type_id);
        })
        .then(() => {
            response.send({
                data: {
                    status: 'done'
                }
            });
            response.end();
            throw new BreakPromiseChainError();
        })
        .catch(err => {
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

router.post('/selected', (request, response) => {
    let type = request.body.type;  //'APPLICATION' or 'BUSINESS'
    let type_ids = request.body.type_ids;

    let connection;

    config.getNewConnection()
        .then(conn => {
            connection = conn;
            return datadeleteutils.deleteSelectedData(connection, type, type_ids);
        })
        .then(() => {
            response.send({
                data: {
                    status: 'done'
                }
            });
            response.end();
            throw new BreakPromiseChainError();
        })
        .catch(err => {
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