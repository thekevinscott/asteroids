const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const moment = require('moment');
const s3Zip = require('s3-zip')

const Bucket = 'deep-asteroids';
const Region = 'US Standard'
/*
const S3Zipper = require ('aws-s3-zipper');
 
const config = {
    accessKeyId: "XXXX",
    secretAccessKey: "XXXX",
    region: "us-west-2",
    bucket: 'XXX'
};
var zipper = new S3Zipper(config);
*/

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
  listObjects: (defaultParams = {}) => {
    return request(s3.listObjects, {
      Bucket,
      Delimiter: '/',
    }).then(data => {
      return data.CommonPrefixes.map(f => {
        const name = f.Prefix.split('/').shift();
        const date = new Date(parseInt(name));

        return {
          date: moment(date).format('MMMM Do, h:mm:ss a'),
          name,
        };
      });
    });
  },
  downloadObjects: (folder) => {
    /*
    const output = fs.createWriteStream(join(__dirname, 'use-s3-zip.zip'))

    var filesArray = []
    this.listObjects(

    var files = s3.listObjects(params).createReadStream()
    s3Zip.archive({
      region: Region,
      bucket: Bucket,
    }, folder, [
      file1,
      file2,
      file3,
      file4
    ])
    .pipe(output)
    */
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
