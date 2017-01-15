const s3 = require('s3');
 
const client = s3.createClient({
  maxAsyncS3: 20,     // this is the default 
  s3RetryCount: 3,    // this is the default 
  s3RetryDelay: 1000, // this is the default 
  multipartUploadThreshold: 20971520, // this is the default (20 MB) 
  multipartUploadSize: 15728640, // this is the default (15 MB) 
  s3Options: {
    accessKeyId: 'AKIAJNTVKDK5KUZMO2YQ',
    secretAccessKey: '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',
    // any other options are passed to new AWS.S3() 
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
  },
});
const fs = require('fs');

function createDirIfNotExist(dir) {
  return new Promise((resolve, reject) => {
    fs.stat(dir, function(err, stat) {
      if(err == null) {
        // file exists
        resolve();
      } else if(err.code == 'ENOENT') {
        fs.mkdir(dir);
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

function saveFile(location, buf) {
  return new Promise((resolve, reject) => {
    const callback = (err, result) => {
      if (err) {
        console.log('error writing file', err);
        reject(err);
      } else {
        resolve(result);
      }
    };

    fs.open(location, 'wx', (err, fd) => {
      if (err) {
        //reject(err);
        fs.appendFile(location, buf, callback);
      }

      fs.writeFile(location, buf, callback);
    });
  });
};

function saveImage(dir, name, time, img) {
  return createDirIfNotExist(`${dir}/images`).then(() => {
    return saveFile(`tmp/${name}/images/${time}.png`, img);
  });
}

function saveJSON(name, time, controls) {

  const row = [
    time,
    controls.space,
    controls.left,
    controls.right,
    controls.up,
    '\r\n',
  ];

  return saveFile(`tmp/${name}/data.csv`, row.join(','));
}

const data = {};

module.exports = function saveData(body) {
  const name = body.name;
  const time = body.time;
  const controls = body.controls;

  const img = new Buffer(body.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

  const dir = `tmp/${name}`;

  return createDirIfNotExist(dir).then(() => {
    return Promise.all([
      saveImage(dir, name, time, img),
      saveJSON(name, time, controls),
    ]);
  }).catch(err => {
    console.error(err);
  });
}
