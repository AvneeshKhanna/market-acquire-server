/**
 * Created by avnee on 15-10-2018.
 */
'use-strict';

const express = require('express');
const router = express.Router();

const csv = require('csvtojson');
const multer = require('multer');
const upload = multer({dest: './docs/'});

const config = require('../../../app.config');
const BreakPromiseChainError = require('../../utils/BreakPromiseChainError');

let dataaddutils = require('./DataAddUtils');
let utils = require('../../utils/Utils');

router.post('/', (request, response) => {
    let type = request.body.type;  //'APPLICATION' or 'BUSINESS'
    let data = request.body.data;

    let connection;

    config.getNewConnection()
        .then(conn => {
            connection = conn;
            return dataaddutils.insertData(connection, type, data);
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

router.post('/file-upload', upload.single('data-file'), (request, response) => {

    let data = request.file;
    let type = request.body.type;

    console.log("file is " + data);

    let connection;

    config.getNewConnection()
        .then(conn => {
            connection = conn;
            return csv().fromFile(data.path);
        })
        .then(jsonArr => {
            return dataaddutils.insertDataMultiple(connection, type, jsonArr);
        })
        .then(() => {
            response.send({
                data: {
                    status: 'done'
                }
            });
            response.end();
        })
        .then(() => {
            return utils.deleteFiles([data.path]);
        })
        .then(() => {
            throw new BreakPromiseChainError(); //To disconnect server
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