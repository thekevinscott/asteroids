var FRAMES_PER_SECOND = CONSTANTS.frames_per_second;
if (`${CONSTANTS.controls}` !== '1') {
  $('body').addClass('hide-controls');
}

function getControls() {
  return [
    'space',
    'left',
    'right',
    'up',
  ].reduce(function(obj, key) {
    obj[key] = KEY_STATUS[key] ? 1 : 0;
    return obj;
  }, {});
};

$(function() {
  let playing = false;
  const frameRate = $('.frame-rate');
  const output = $('.output tbody');
  const startTime = new Date();
  function frame() {
    const d = new Date();
    const time = (d.getTime() - startTime.getTime()) / 1000;
    const controls = getControls();

    output.prepend(
      '<tr>' +
        '<td>' + parseFloat(time).toFixed(4) + '</td>' + 
        '<td>'+ controls.space + '</td>'+
        '<td>' + controls.left + '</td>' +
        '<td>' + controls.right + '</td>' +
        '<td>' + controls.up + '</td>' +
      '</tr>'
    );

    if (playing) {
      setTimeout(frame, 1000 / FRAMES_PER_SECOND);
    }
  }

  for (var i=1; i <= 60; i++) {
    if (i === FRAMES_PER_SECOND) {
      frameRate.append('<option selected>' + i + '</option>');
    } else {
      frameRate.append('<option>' + i + '</option>');
    }
  }

  frameRate.change(function(e) {
    FRAMES_PER_SECOND = frameRate.val();
  });

  function start() {
    playing = true;
    frame();
  }

  function end() {
    playing = false;
  }

  Game.addListener('start', start);
  Game.addListener('end_game', end);
});
