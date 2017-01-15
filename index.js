const express = require('express')
const port = process.env.PORT || 3000;
const app = express()
const mustacheExpress = require('mustache-express');

app.set('view engine', 'mustache');
app.engine('html', mustacheExpress());

app.get('/', (req, res) => {
  const CONSTANTS = Object.assign({}, {
    controls: 1,
    frames_per_second: 30,
  }, req.query);
  res.render(__dirname + '/public/index.html', {
    CONSTANTS: JSON.stringify(CONSTANTS),
  });
});
app.use(express.static('public'))

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
})
