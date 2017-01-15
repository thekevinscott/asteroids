function takeScreenshot(canvas, game_start, playing) {
  const dataURL = canvas[0].toDataURL();

  $.ajax({
    type: 'post',
    url: '/save',
    data: {
      name: game_start,
      image: dataURL,
      time: (new Date()).getTime(),
      controls: getControls(),
      dimensions: {
        height: canvas.height(),
        width: canvas.width(),
      }
    }
  });

  if (playing) {
    const timeout = parseInt(1000 / FRAMES_PER_SECOND);
    setTimeout(() => {
      takeScreenshot(canvas);
    }, timeout);
  }
}

$(function () {
  if (`${CONSTANTS.remote}` !== '1') {
    const canvas = $('canvas');
    let game_start;
    let playing = false;

    function start() {
      game_start = (new Date()).getTime();
      playing = true;
      takeScreenshot(canvas, game_start, playing);
    }

    function end() {
      playing = false;
    }

    Game.addListener('start', start);
    Game.addListener('end_game', end);
  }
});
