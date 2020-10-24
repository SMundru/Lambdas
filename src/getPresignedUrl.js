const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
    return new Promise((resolve, reject) => {
        const {operation, bucket, key} = event.queryStringParameters;
        let params = {Bucket: bucket, Key: key};
        let url
        switch (operation) {
            case "get" :
                url = s3.getSignedUrl('getObject', params);
                break
            case "put":
                url = s3.getSignedUrl('putObject', params);
        }
        const r = {"signedUrl" : url}
        let response = {
            "statusCode": 200,
            "headers": {
                "Access -Control-Allow-Origin": "*"
            },
            "body": JSON.stringify(r),
            "isBase64Encoded": false
        };
        callback(null, response);
    });
};
