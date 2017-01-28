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
  var moveX = 0;
  var moveY = 0;
  if (range == undefined) {
    moveX = data[1][0] - data[0][0];
    var tail = data[data.length - 1];
    var head = data.shift();
    head[0] = tail[0] + moveX;
    //console.log("last: " + head);
    data.push(head);
  } else {
    moveX = range[0];
    moveY = range[1];
  }
  var len = data.length;
  for (var i = 0; i < len; ++i) {
    data[i][0] -= moveX;
    data[i][1] -= moveY;
  }
}
function selfAdapter(data, stageW, stageH) {
  var xrange = data.shift();
  var yrange = data.shift();
  var tail = data[data.length - 1];
  var scalex = 0.7 * stageW/(xrange[1] - xrange[0]);
  var scaley = 0.6 * stageH/(yrange[1] - yrange[0]);
  for (var i = 0; i < data.length; ++i) {
    data[i][0] = stageW/2 + data[i][0] * scalex;
    data[i][1] = stageH/2 - 200 - data[i][1] * scaley;
  }
}
function trim(str){
	return str.replace(/\s|\xA0/g,"");
}
module.exports = {
  formatTime: formatTime,
  readData: readData,
  move: move,
  selfAdapter: selfAdapter,
  trim:trim
}
