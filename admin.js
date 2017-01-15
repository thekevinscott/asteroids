const s3 = require('./s3');

module.exports = (req, res) => {
  s3.listObjects().then((folders) => {
    console.log(folders);
    res.render(__dirname + '/public/admin.html', {
      folders,
    });
  }).catch(err => {
    res.json({ err });
  });

};
