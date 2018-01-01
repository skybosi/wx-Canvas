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

function move(data, range) {
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

function selfAdapter(data, center, stageW, stageH) {
  if (undefined == data || 0 == data.length || !data instanceof Array)
    return data;
  var xrange = data.shift();
  var yrange = data.shift();
  var head = data[0];
  var tail = data[data.length - 1];
  var scalex = 0.8 * stageW / (xrange[1] - xrange[0]);
  var scaley = 0.8 * stageH / (yrange[1] - yrange[0]);
  var scale = Math.max(scalex, scaley);
  //get middle of valid x-range and reset origin point
  //center[0] -= (xrange[0] + xrange[1])*scalex/2;  //is error
  center[0] -= (head[0] + tail[0]) * scalex / 2;
  for (var i = 0; i < data.length; ++i) {
    data[i].push([data[i][0], data[i][1]]);
    data[i][0] = center[0] + data[i][0] * scalex;
    data[i][1] = center[1] - data[i][1] * scalex;
  }
  return scalex;
}

function trim(str) {
  return str.replace(/\s|\xA0/g, "");
}

function toString(point) {
  return point[0].toFixed(3) + ", " + point[1].toFixed(1)// + point[2];
}

function obj2string(obj) {
  var str = ""
  for (var a in obj) {
    if (typeof (obj[a]) == "object") {
      str += ("\t" + a + " = " + obj2string(obj[a]) + "\n"); //递归遍历
    }
    else {
      str += (a + " = " + obj[a] + "\n");//值就显示
    }
  }
  return str
}

function similarLen(src, dst) {
  var len = ((src.length < dst.length) ? src.length : dst.length)
  for (var i = 0; i < len; i++) {
    if (src[i] != dst[i]) {
      break;
    }
  }
  return i + 1;
}

Array.prototype.indexof = function (value) {
  var that = this || [];
  for (var i = 0; i < that.length; i++) {
    if (that[i] == value)
      return i;
  }
  return -1;
}

String.prototype.del = function (index) {
  index = (index < 0) ? (this.length + index) : (index)
  var ast = this.split('');
  ast[index] = ''
  return ast.join('');
}

String.prototype.swap = function (s, e) {
  s = (s < 0) ? (this.length + s) : (s)
  e = (e < 0) ? (this.length + e) : (e)
  var ast = this.split('');
  [ast[s], ast[e]] = [ast[e], ast[s]];
  return ast.join('');
}

String.prototype.insert = function (str, offset) {
  if (undefined != offset && offset >= 0 && offset < this.length) {
    return this.slice(0, offset) + str + this.slice(offset);
  } else {
    return this;
  }
}

var MAX = 1e10;
var MIN = 1e-10;

function isVaild(num) {
  if ((typeof (num)) == "number") {
    if (num < MAX && num > MIN) {
      return true;
    }
    return false;
  } else if (!isNaN(parseFloat(num))) {
    var nums = parseFloat(num);
    if (nums < MAX && nums > MIN) {
      return true;
    }
    return false;
  } else {
    return false;
  }
}

function dealInput(input) {
  var out = {};
  var inputs = input.split(";");
  if (inputs.length == 2) {
    out.method = inputs[0];
    out.arange = JSON.parse(inputs[1]);;
  } else {
    out.method = inputs[0];
    out.arange = null;
  }
  return out;
}

module.exports = {
  selfAdapter: selfAdapter,
  formatTime: formatTime,
  dealInput: dealInput,
  toString: toString,
  isVaild: isVaild,
  move: move,
  trim: trim
}
