const express = require('express')
const port = process.env.PORT || 3000;
const app = express()
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser')
const saveData = require('./saveData');

app.set('view engine', 'mustache');
app.engine('html', mustacheExpress());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const CONSTANTS = Object.assign({}, {
    controls: 1,
    frames_per_second: 1,
  }, req.query);
  res.render(__dirname + '/public/index.html', {
    CONSTANTS: JSON.stringify(CONSTANTS),
  });
});

app.post('/save', (req, res) => {
  saveData(req.body).then(() => {
    res.json({});
  }).catch(err => {
    res.json({ err });
  });
});

app.use(express.static('public'))

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
})
