KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  70: 'f',
  71: 'g',
  72: 'h',
  77: 'm',
  80: 'p'
}

KEY_STATUS = { keyDown:false };
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}

$(function() {
  if (CONSTANTS.remote !== 1) {
    $(window).keydown(function (e) {
      KEY_STATUS.keyDown = true;
      if (KEY_CODES[e.keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = true;
      }
    }).keyup(function (e) {
      KEY_STATUS.keyDown = false;
      if (KEY_CODES[e.keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = false;
      }
    });
  } else {
    const canvas = $('canvas');

    function sendCameraData() {
      const timeout = parseInt(1000 / FRAMES_PER_SECOND);
      const dataURL = canvas[0].toDataURL();

      pythonSocket.emit('camera', {
        time: (new Date()).getTime(),
        foo: 'bar',
        //image: dataURL,
      });

      setTimeout(sendCameraData, timeout);
    }

    pythonSocket.on('controls', function(controls){
      console.log('hey now', controls);
      Object.keys(controls).map(key => {
        KEY_STATUS[key] = controls[key] === 1 ? true : false;
      });
    });

    sendCameraData();
  }
});
