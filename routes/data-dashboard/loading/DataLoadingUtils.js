/**
 * Created by avnee on 09-10-2018.
 */
'use-strict';

async function loadApplicationData(connection, lastindexkey, limit, filter) {

    lastindexkey = lastindexkey ? Number(lastindexkey) : 0;

    let where_clauses = [];

    let no_filter_condition = true;

    for (let key in filter) {
        if(filter[key] !== undefined){

            no_filter_condition = false;

            switch(key) {
                case 'firstname':
                    where_clauses.push('MATCH(firstname) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'lastname':
                    where_clauses.push('MATCH(lastname) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'phone':
                    where_clauses.push('MATCH(phone) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'email':
                    where_clauses.push('MATCH(email) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'city':
                    where_clauses.push('MATCH(city) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'area':
                    where_clauses.push('MATCH(area) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'state':
                    where_clauses.push('MATCH(state) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'industry':
                    where_clauses.push('MATCH(industry) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'project':
                    where_clauses.push('MATCH(project) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'source':
                    where_clauses.push('MATCH(source) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'served':
                    where_clauses.push('MATCH(served) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
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
            'WHERE ' + where_clauses.join(' AND ') + ' ' +
            'LIMIT ? ' +
            'OFFSET ?', [limit, lastindexkey], (err, rows) => {
            if(err){
                reject(err);
            }
            else{
                lastindexkey = lastindexkey + rows.length;

                resolve({
                    requestmore: rows.length >= limit,
                    lastindexkey: lastindexkey,
                    items: rows
                });
            }
        });

    });
}

async function loadBusinessData(connection, lastindexkey, limit, filter) {

    lastindexkey = lastindexkey ? Number(lastindexkey) : 0;

    let where_clauses = [];

    let no_filter_condition = true;

    for (let key in filter) {
        if(filter[key] !== undefined){

            no_filter_condition = false;

            switch(key) {
                case 'businessname':
                    where_clauses.push('MATCH(businessname) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'contactpersonname':
                    where_clauses.push('MATCH(contactpersonname) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'designation':
                    where_clauses.push('MATCH(designation) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'pincode':
                    where_clauses.push('MATCH(pincode) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'address':
                    where_clauses.push('MATCH(address) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'phone':
                    where_clauses.push('MATCH(phone) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'email':
                    where_clauses.push('MATCH(email) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'city':
                    where_clauses.push('MATCH(city) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'state':
                    where_clauses.push('MATCH(state) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
                    break;
                case 'industry':
                    where_clauses.push('MATCH(industry) AGAINST (' + JSON.stringify(filter[key]) + ' IN BOOLEAN MODE)');
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
            'WHERE ' + where_clauses.join(' AND ') + ' ' +
            'LIMIT ? ' +
            'OFFSET ?', [limit, lastindexkey], (err, rows) => {
            if(err){
                reject(err);
            }
            else{
                lastindexkey = lastindexkey + rows.length;

                resolve({
                    requestmore: rows.length >= limit,
                    lastindexkey: lastindexkey,
                    items: rows
                });
            }
        });

    });
}

module.exports = {
    loadApplicationData: loadApplicationData,
    loadBusinessData: loadBusinessData
};