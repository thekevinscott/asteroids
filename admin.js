const s3 = require('./s3');

module.exports = app => {
  app.get('/admin', (req, res) => {
    s3.listObjects().then((folders) => {
      res.render(__dirname + '/public/admin.html', {
        folders,
      });
    }).catch(err => {
      res.json({ err });
    });
  });

  app.get('/admin/:date', (req, res) => {
    console.log(req.params, req.body, req.query);
    s3.downloadObjects(req.params.date).then(() => {
      res.json({});
    }).catch(err => {
      res.json({ err });
    });
  });
};
