/**
 * Created by avnee on 10-11-2018.
 */
'use-strict';

const config = require('../../../app.config');
const AWS = config.AWS;

const utils = require('../../utils/Utils');

async function sendEmail(payload, toAddresses) {
    return new Promise((resolve, reject) => {
        let params = {
            Destination: {
                ToAddresses: toAddresses
            },
            Message: {
                Body: {
                    /*Html: {
                        Charset: "UTF-8",
                        Data: strhtml
                    },*/
                    Text: {
                        Charset: "UTF-8",
                        Data: "You have received a new form entry on www.thetestament.com \n\n" + mailBody(payload)
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: 'New Form Entry: ' + payload['_subject']
                }
            },
            Source: "The Testament <admin@cread.in>"
        };

        utils.setAWSConfigForSES(AWS);
        const ses = new AWS.SES();

        ses.sendEmail(params, function (err, data) {

            utils.resetAWSConfig(AWS);

            if (err) {
                reject(err);
            }
            else {
                console.log("Transaction email response " + JSON.stringify(data, null, 3));
                resolve(data);
            }

            /*
             data = {
             MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
             }
             */
        });
    });
}

function mailBody(payload) {
    let txt = '';

    for (let field in payload) {
        txt += field + ':\n' + payload[field] + '\n\n';
    }

    return txt;

}

module.exports = {
    sendEmail: sendEmail
};