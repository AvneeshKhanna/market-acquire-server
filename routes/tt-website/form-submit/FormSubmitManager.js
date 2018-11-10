/**
 * Created by avnee on 10-11-2018.
 */
'use-strict';

const express = require('express');
const router = express.Router();

const config = require('../../../app.config');
const BreakPromiseChainError = require('../../utils/BreakPromiseChainError');

const formsubmitutils = require('./FormSubmitUtils');

router.post('/', (request, response) => {

    console.log("request is " + JSON.stringify(request.body, null, 3));

    formsubmitutils.sendEmail(request.body, ['admin@thetestament.com', 'recruitment@thetestament.com'])
        .then(data => {
            response.send({
                data: {
                    status: 'done'
                }
            }).end();
        })
        .catch(err => {
            if (err instanceof BreakPromiseChainError) {
                //Do nothing
            }
            else {
                console.error(err);
                response.status(500).send({
                    message: 'Some error occurred at the server'
                }).end();
            }
        });

});

module.exports = router;