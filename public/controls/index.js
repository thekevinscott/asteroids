let FRAMES_PER_SECOND = 30;

const getControls = () => {
  return [
    'space',
    'left',
    'right',
    'up',
  ].reduce((obj, key) => {
    return Object.assign({}, obj, {
      [key]: KEY_STATUS[key] ? 1 : 0,
    });
  }, {});
};

$(function() {
  const frameRate = $('.frame-rate');
  const output = $('.output tbody');
  const start = new Date();
  const frame = () => {
    const d = new Date();
    const time = (d.getTime() - start.getTime()) / 1000;
    const {
      space,
      left,
      right,
      up,
    } = getControls();
    output.prepend(`
                  <tr>
                    <td>${parseFloat(time).toFixed(4)}</td>
                    <td>${space}</td>
                    <td>${left}</td>
                    <td>${right}</td>
                    <td>${up}</td>
                  </tr>
                  `);
    setTimeout(frame, 1000 / FRAMES_PER_SECOND);
  }

  for (let i=1; i <= 60; i++) {
    if (i === FRAMES_PER_SECOND) {
      frameRate.append(`<option selected>${i}</option>`);
    } else {
      frameRate.append(`<option>${i}</option>`);
    }
  }
  frameRate.change((e) => {
    FRAMES_PER_SECOND = frameRate.val();
  });

  frame();
});
