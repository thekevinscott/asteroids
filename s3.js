const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'deep-asteroids';

const myKey = 'foobar';

s3.createBucket({
  Bucket,
}, (err) => {
  if (err) {
    console.error('error creating bucket', err);
  }
});

module.exports = {
  save: (Key, Body) => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket,
        Key,
        Body,
      };

      s3.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve('Successfully uploaded data to ');
        }
      });
    });
  },
};
