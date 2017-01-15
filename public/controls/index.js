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

const FRAMES_PER_SECOND = 3;
$(function() {
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
  frame();
});
