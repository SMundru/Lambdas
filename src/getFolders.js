const AWS = require('aws-sdk');
var s3 = new AWS.S3();
exports.handler = (event, context, callback) => {
    return new Promise((resolve, reject) => {
        const s3params = {
            Bucket: event.queryStringParameters.bucket,
            MaxKeys: 1000,
            Delimiter: '/',
            Prefix: event.queryStringParameters.folder
        };
        s3.listObjectsV2(s3params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                let response = {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": JSON.stringify(data),
                    "isBase64Encoded": false
                };
                callback(null, response);
            }
        });
    });
};
