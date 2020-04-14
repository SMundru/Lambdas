const multipart = require('aws-lambda-multipart-parser')


exports.handler = (event, context, callback) => {
    return new Promise((resolve, reject) => {
        console.log(event)
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(multipart.parse(event, false)),
        };
        callback(null, response);
    });
};
