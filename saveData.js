const save = require('./s3').save;

function saveImage(name, time, img) {
  const location = `${name}/images/${time}.png`;
  save(location, img);
}

const rows = [];
function saveJSON(name, time, controls) {
  const row = [
    time,
    controls.space,
    controls.left,
    controls.right,
    controls.up,
    '\r\n',
  ];

  rows.push(row.join(','));

  const location = `${name}/data.csv`;
  console.log(location);
  save(location, JSON.stringify(rows));
}

module.exports = function saveData(body) {
  const name = body.name;
  const time = body.time;
  const controls = body.controls;

  const img = new Buffer(body.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

  return Promise.all([
    saveImage(name, time, img),
    saveJSON(name, time, controls),
  ]);
}
