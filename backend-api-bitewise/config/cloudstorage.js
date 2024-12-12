const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

dotenv.config();

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: process.env.GCLOUD_KEYFILE,
});

const bucketProfile = storage.bucket(process.env.GCLOUD_BUCKET_NAMEPROFILE);

const bucketPost = storage.bucket(process.env.GCLOUD_BUCKET_NAMEPOST);


module.exports = { bucketProfile, bucketPost };