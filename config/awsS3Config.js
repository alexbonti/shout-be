/*
*Please add project folder name and ibm bucket name here,
* make sure project folder name doesnt not have spaces in between and is same
* as the name you give while running upload_setup.sh
*/
'use strict';
/*var s3BucketCredentials = {
    "projectFolder": "Shout",
    "bucket": "ipan-v2-bucket",
    "endpoint": 's3.au-syd.cloud-object-storage.appdomain.cloud',
    "apiKeyId": 'mhNbtjQUlsq2LBh5F03g81g1Wcq8hN6H1ZrWnpRtcD3L',
    "serviceInstanceId": "crn:v1:bluemix:public:cloud-object-storage:global:a/200d885c6c6a4629814c74e3c7594d35:bb53fed0-c301-4705-ad41-27a08a0ae3a6:bucket:ipan-v2-bucket",
    "folder": {
        "profilePicture": "profilePicture",
        "thumb": "thumb",
        "original": "original",
        "image": "image",
        "docs": "docs",
        "files": "files"
    }
};*/

var s3BucketCredentials = {
    "projectFolder": "Shout",
    "bucket": "roots-deakin-launchpad",
    "endpoint": 's3.au-syd.cloud-object-storage.appdomain.cloud',
    "apiKeyId": 'iumd7hzzPsquU1aRyp3JzzhHNWnjAVj6rNKvVbzOB-AZ',
    "serviceInstanceId": "crn:v1:bluemix:public:cloud-object-storage:global:a/3f6150e9065040f4b5fd0ac6bda85bbe:e0902e3c-1abb-460d-b6e3-9dc089f79556:bucket:roots-deakin-launchpad",
    "folder": {
        "profilePicture": "profilePicture",
        "thumb": "thumb",
        "original": "original",
        "image": "image",
        "docs": "docs",
        "files": "files"
    }
};

module.exports = {
    s3BucketCredentials: s3BucketCredentials
};
