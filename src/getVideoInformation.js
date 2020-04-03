const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
exports.handler = (event, context, callback) => {
    return new Promise((resolve, reject) => {
        const {bucket, folder, delimiter} = event.queryStringParameters;
        const s3params = {
            Bucket: bucket,
            MaxKeys: 1000,
            Delimiter: delimiter,
            Prefix: folder
        };
        s3.listObjectsV2(s3params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const keys = data.Contents.map(c => {
                    if (c.Key !== folder) {
                        return c.Key;
                    }
                }).filter(x => x);

                let Keys = keys.map(x => {
                    const key = x.split(".")[0];
                    return {
                        "name": {
                            S: `${key}`
                        }
                    }
                });

                const dynamoRequest = {
                    RequestItems: {
                        "VideoInfo": {Keys}
                    }
                };

                dynamoDb.batchGetItem(dynamoRequest, (error, output) => {
                    if (error) {
                        reject(error)
                    } else {
                        const result = {};
                        keys.map(k => {
                            let element = output.Responses.VideoInfo.filter(r => k.indexOf(r.name.S) !== -1)[0];
                            result[k] = typeof element !== 'undefined' ? element : {};
                        });
                        let response = {
                            "statusCode": 200,
                            "headers": {
                                "Access-Control-Allow-Origin": "*"
                            },
                            "body": JSON.stringify(result),
                            "isBase64Encoded": false
                        };
                        callback(null, response);
                    }
                });

            }
        });
    })
        ;
};
