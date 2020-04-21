const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});
AWS.config.mediaconvert = {endpoint: 'https://ey3xqwxpb.mediaconvert.eu-west-2.amazonaws.com'};

exports.handler = (event, context, callback) => {

    let fileKey = event.Records[0].s3.object.key;
    let bucket = event.Records[0].s3.bucket.name;

    let split = fileKey.split('/');

    const filePath = split.slice(0, split.length - 1).join('/');
    const params = {
        "Queue": "arn:aws:mediaconvert:eu-west-2:478441108957:queues/Default",
        "UserMetadata": {},
        "Role": "arn:aws:iam::478441108957:role/MediaConvertRole",
        "Settings": {
            "OutputGroups": [
                {
                    "CustomName": "Posters",
                    "Name": "File Group",
                    "Outputs": [
                        {
                            "ContainerSettings": {
                                "Container": "RAW"
                            },
                            "VideoDescription": {
                                "ScalingBehavior": "DEFAULT",
                                "TimecodeInsertion": "DISABLED",
                                "AntiAlias": "ENABLED",
                                "Sharpness": 50,
                                "CodecSettings": {
                                    "Codec": "FRAME_CAPTURE",
                                    "FrameCaptureSettings": {
                                        "FramerateNumerator": 30,
                                        "FramerateDenominator": 15,
                                        "MaxCaptures": 2,
                                        "Quality": 80
                                    }
                                },
                                "DropFrameTimecode": "ENABLED",
                                "ColorMetadata": "INSERT"
                            },
                            "Extension": ".png"
                        }
                    ],
                    "OutputGroupSettings": {
                        "Type": "FILE_GROUP_SETTINGS",
                        "FileGroupSettings": {
                            "Destination": "s3://agastya-posters/" + filePath + "/"
                        }
                    }
                },
                {
                    "CustomName": "VideoGroup",
                    "Name": "File Group",
                    "Outputs": [
                        {
                            "ContainerSettings": {
                                "Container": "MP4",
                                "Mp4Settings": {
                                    "CslgAtom": "INCLUDE",
                                    "CttsVersion": 0,
                                    "FreeSpaceBox": "EXCLUDE",
                                    "MoovPlacement": "PROGRESSIVE_DOWNLOAD"
                                }
                            },
                            "VideoDescription": {
                                "ScalingBehavior": "DEFAULT",
                                "TimecodeInsertion": "DISABLED",
                                "AntiAlias": "ENABLED",
                                "Sharpness": 50,
                                "CodecSettings": {
                                    "Codec": "H_264",
                                    "H264Settings": {
                                        "InterlaceMode": "PROGRESSIVE",
                                        "NumberReferenceFrames": 3,
                                        "Syntax": "DEFAULT",
                                        "Softness": 0,
                                        "GopClosedCadence": 1,
                                        "GopSize": 90,
                                        "Slices": 1,
                                        "GopBReference": "DISABLED",
                                        "SlowPal": "DISABLED",
                                        "SpatialAdaptiveQuantization": "ENABLED",
                                        "TemporalAdaptiveQuantization": "ENABLED",
                                        "FlickerAdaptiveQuantization": "DISABLED",
                                        "EntropyEncoding": "CABAC",
                                        "Bitrate": 4500000,
                                        "FramerateControl": "INITIALIZE_FROM_SOURCE",
                                        "RateControlMode": "CBR",
                                        "CodecProfile": "MAIN",
                                        "Telecine": "NONE",
                                        "MinIInterval": 0,
                                        "AdaptiveQuantization": "HIGH",
                                        "CodecLevel": "AUTO",
                                        "FieldEncoding": "PAFF",
                                        "SceneChangeDetect": "ENABLED",
                                        "QualityTuningLevel": "SINGLE_PASS",
                                        "FramerateConversionAlgorithm": "DUPLICATE_DROP",
                                        "UnregisteredSeiTimecode": "DISABLED",
                                        "GopSizeUnits": "FRAMES",
                                        "ParControl": "INITIALIZE_FROM_SOURCE",
                                        "NumberBFramesBetweenReferenceFrames": 2,
                                        "RepeatPps": "DISABLED",
                                        "DynamicSubGop": "STATIC"
                                    }
                                },
                                "AfdSignaling": "NONE",
                                "DropFrameTimecode": "ENABLED",
                                "RespondToAfd": "NONE",
                                "ColorMetadata": "INSERT"
                            },
                            "AudioDescriptions": [
                                {
                                    "AudioTypeControl": "FOLLOW_INPUT",
                                    "CodecSettings": {
                                        "Codec": "AAC",
                                        "AacSettings": {
                                            "AudioDescriptionBroadcasterMix": "NORMAL",
                                            "Bitrate": 96000,
                                            "RateControlMode": "CBR",
                                            "CodecProfile": "LC",
                                            "CodingMode": "CODING_MODE_2_0",
                                            "RawFormat": "NONE",
                                            "SampleRate": 48000,
                                            "Specification": "MPEG4"
                                        }
                                    },
                                    "LanguageCodeControl": "FOLLOW_INPUT"
                                }
                            ]
                        }
                    ],
                    "OutputGroupSettings": {
                        "Type": "FILE_GROUP_SETTINGS",
                        "FileGroupSettings": {
                            "Destination": "s3://agastya-encoded/" + filePath + "/"
                        }
                    }
                }
            ],
            "AdAvailOffset": 0,
            "Inputs": [
                {
                    "AudioSelectors": {
                        "Audio Selector 1": {
                            "Offset": 0,
                            "DefaultSelection": "DEFAULT",
                            "ProgramSelection": 1
                        }
                    },
                    "VideoSelector": {
                        "ColorSpace": "FOLLOW",
                        "Rotate": "DEGREE_0",
                        "AlphaBehavior": "DISCARD"
                    },
                    "FilterEnable": "AUTO",
                    "PsiControl": "USE_PSI",
                    "FilterStrength": 0,
                    "DeblockFilter": "DISABLED",
                    "DenoiseFilter": "DISABLED",
                    "TimecodeSource": "EMBEDDED",
                    "FileInput": "s3://" + bucket + "/" + fileKey
                }
            ]
        },
        "AccelerationSettings": {
            "Mode": "DISABLED"
        },
        "StatusUpdateInterval": "SECONDS_60",
        "Priority": 0
    };
    const templateJobPromise = new AWS.MediaConvert({apiVersion: '2017-08-29'}).createJob(params).promise();

    templateJobPromise.then(
        function (data) {
            console.log("Success! ", data);
        },
        function (err) {
            console.log("Error", err);
        }
    );

    let objectName = fileKey.split('.')[0];

    const dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    const dbParams = {
        Item: {
            "Year": {
                N: filePath
            },
            "S3Name": {
                S: `${fileKey}`
            },
            "PosterUrl": {
                S: 'https://agastya-posters.s3.eu-west-2.amazonaws.com/' + objectName + '.0000001.png'
            },
            "VideoUrl": {
                S: 'https://d27s0pq0m2kt4k.cloudfront.net/' + objectName + '.mp4'
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: "Videos"
    };
    dynamoDb.putItem(dbParams, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
    });
};


