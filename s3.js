const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Bucket = 'deep-asteroids';
const moment = require('moment');

const myKey = 'foobar';

s3.createBucket({
  Bucket,
}, (err) => {
  if (err) {
    console.error('error creating bucket', err);
  }
});

const request = (method, params) => {
  return new Promise((resolve, reject) => {
    method.call(s3, params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  listObjects: () => {
    return request(s3.listObjects, {
      Bucket,
      Delimiter: '/',
    }).then(data => {
      return data.CommonPrefixes.map(f => {
        const name = f.Prefix.split('/').shift();
        const date = new Date(name);
        console.log(date);

        return {
          date: moment(date).format('MMMM Do, h:mm:ss a'),
          name,
        };
      });
    });
  },
  save: (Key, Body) => {
    const params = {
      Bucket,
      Key,
      Body,
    };

    return request(s3.putObject, params);
  },
};
