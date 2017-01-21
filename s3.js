const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const moment = require('moment');
const fs = require('fs');
const s3Zip = require('s3-zip');
const join = require('path').join;

const Bucket = 'deep-asteroids';
const Region = 'us-east-1';
const XmlStream = require('xml-stream');
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

const defaultParams = {
  Delimiter: '/',
};

const s3Methods = {
  listFolders: () => {
    return s3Methods.listObjects().then(data => {
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
  listObjects: (params = defaultParams) => {
    return request(s3.listObjects, Object.assign({
      Bucket,
    }, params));
  },
  downloadObjects: (Prefix) => {
    return s3Methods.listObjects({
      Prefix,
    }).then(files => {
      return files.Contents.map(file => `/${file.Key.split('/').slice(1).join('/')}`);
    }).then(files => s3Zip.archive({
      region: Region,
      bucket: Bucket
    }, Prefix, files));
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

module.exports = s3Methods;
