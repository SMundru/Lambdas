const AWS = require('aws-sdk');
const s3 = new AWS.S3();
exports.handler = (event, context, callback) => {
    return new Promise((resolve, reject) => {
        const {bucket} = event.queryStringParameters;
        const s3params = {
            Bucket: bucket,
            MaxKeys: 1000,
            Delimiter: "/"
        };
        s3.listObjectsV2(s3params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const keys = data.CommonPrefixes.map(c => c.Prefix).filter(x => x);

                let response = {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": JSON.stringify(keys),
                    "isBase64Encoded": false
                };
                callback(null, response);
            }
        });
    });
};
