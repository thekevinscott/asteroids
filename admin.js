const s3 = require('./s3');

module.exports = app => {
  app.get('/admin', (req, res) => {
    s3.listFolders().then((folders) => {
      res.render(__dirname + '/public/admin.html', {
        folders,
      });
    }).catch(err => {
      res.json({ err });
    });
  });

  app.get('/admin/:date', (req, res) => {
    s3.downloadObjects(req.params.date).then(output => {
      res.setHeader('Content-disposition', `attachment; filename=${req.params.date}.zip`);
      res.setHeader('Content-type', 'application/zip');
      output.pipe(res);
    }).catch(err => {
      console.error(err);
      res.json({ err });
    });
  });
};
