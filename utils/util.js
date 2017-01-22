function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function readData(date) {
}
function move(data,range) {
  var moveX;
  if (range == undefined) {
    moveX = data[1][0] - data[0][0];
    var tail = data[data.length - 1];
    var head = data.shift();
    head[0] = tail[0] + moveX;
    //console.log("last: " + head);
    data.push(head);
  } else {
    moveX = range[0] * 0.5;
  }
  for (var i = 0; i < data.length; ++i) {
    data[i][0] -= moveX;
  }
}
function selfAdapter(data, stageW, stageH) {
  var head = data[0];
  var tail = data[data.length - 1];
  var scalex = stageW / (tail[0] - head[0]);
  var scaley = scalex / 0.618;
  for (var i = 0; i < data.length; ++i) {
    data[i][0] *= scalex;
    data[i][1] *= scaley;
  }
}

module.exports = {
  formatTime: formatTime,
  readData: readData,
  move: move,
  selfAdapter: selfAdapter
}
