const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fileType = require('file-type')
const multipart = require('aws-lambda-multipart-parser')

let getFile = function (fileMime, buffer, fileName, title, description, year) {
    let fileExt = fileMime.mime;

    let filePath = year + '/';
    let fileFullName = fileName + '.' + fileExt;
    let fileFullNameWithPath = filePath + fileName;
    let fileFullPath = 'agastya-videos-preprocess' + fileFullName;

    let params = {
        Bucket: 'agastya-videos-preprocess',
        Key: fileFullNameWithPath,
        Body: buffer
    };

    let uploadFile = {
        size: buffer.toString('ascii').length,
        type: fileMime.mime,
        name: fileName,
        full_path: fileFullPath
    };

    return {
        'params': params,
        'uploadFile': uploadFile
    };
}

exports.handler = (event, context, callback) => {
    return new Promise((resolve, reject) => {
        const request = event.body;
        const {fileName, title, description, year} = event.queryStringParameters
        let base64String = request.base64String;
        let buffer = Buffer.from(base64String, 'base64');
        let fileMime = fileType.fromBuffer(buffer)

        if (fileMime === null) {
            return context.fail("not a file type");
        }

        let file = getFile(fileMime, buffer, fileName, title, description, year);
        let params = file.params;


        s3.putObject(params, function (err, data) {
            if (err) {
                return console.log(err)
            }

            return console.log('File Url', file.full_path)

        })
    });
};
