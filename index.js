const express = require('express')
const port = process.env.PORT || 3000;
const app = express()
var exphbs  = require('express-handlebars');
const bodyParser = require('body-parser')
const saveData = require('./saveData');
const admin = require('./admin');
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.engine('html', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const CONSTANTS = Object.assign({}, {
    controls: 1,
    frames_per_second: 5,
    remote: 0,
  }, req.query);

  if (`${CONSTANTS.remote}` === '1') {
    /*
    const clientIo = require('socket.io-client');
    const pythonSocket = clientIo.connect('http://localhost:9000');
    pythonSocket.on('connect', () => {
      console.log('connected to python');
    });

    io.on('connection', function(socket){
      socket.on('camera', (data) => {
        pythonSocket.emit('camera', data);
        pythonSocket.on('control', data => {
          socket.emit('control', {
            space: Math.round(Math.random()),
            left: Math.round(Math.random()),
            right: Math.round(Math.random()),
            up: Math.round(Math.random()),
          });
        });
      });
    });
    */
  }

  res.render(__dirname + '/public/index.html', {
    CONSTANTS: JSON.stringify(CONSTANTS),
  });
});

app.get('/admin', admin);

app.post('/save', (req, res) => {
  console.log((new Date()).getTime() - req.body.time);
  saveData(req.body).then(() => {
    res.json({});
  }).catch(err => {
    res.json({ err });
  });
});

app.use(express.static('public'))

http.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
})
