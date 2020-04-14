const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
exports.handler = (event, context, callback) => {

    const groupBy = function(xs, key) {
        return xs.reduce(function(rv, x) {
            let mapKey = x[key].S;
            if(typeof mapKey === 'undefined') {
                mapKey = x[key].N;
            }
            (rv[mapKey] = rv[mapKey] || []).push(x);
            return rv;
        }, {});
    };

    return new Promise((resolve, reject) => {

        const scanRequest = {
            TableName: "Videos"
        };

        dynamoDb.scan(scanRequest, (e, output) => {
            if (e) {
                reject(e)
            } else {
                let years = [];
                const categories = [];

                output.Items.map(item => {
                    years.push(item.Year.N);
                });

                years = [...new Set(years)]
                const yearVideoMap = groupBy(output.Items, 'Year');

                const result = {years, categories, yearVideoMap}

                let response = {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": result,
                    "isBase64Encoded": false
                };
                callback(null, response);
            }
        });
    });
};
