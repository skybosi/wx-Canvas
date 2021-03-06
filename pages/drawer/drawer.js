var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../lib/expression.js");
var cpuData = Data.data.cpu.slice();
var timer = null;
var ploted = false;
var locked = false;
var moveArray = [];
var data = [];
var data2 = [];
var context;
var origin = [0, 0];
var canvasW = 0;
var canvasH = 0;
var oldcolor;
var gridSwitch = true;
var modeSwitch = false;
var input = "";
var scale = 1.0;
var unit = 1
var curinput = ""
var MODE_LINER = 0
var MODE_SCATTER = 1
//draw line each point
function draw(ctx, srcdata, color) {
  if (color == undefined) {
    //color = "black";
    color = oldcolor;
  }
  var delta = 1;
  if (modeSwitch == true)
  {
    delta = 2
  }
  ctx.save();
  ctx.beginPath();
  ctx.setStrokeStyle(color);
  ctx.setLineWidth(2);
  oldcolor = color;
  var nan = false;
  //console.log("srcdata: " + srcdata);
  if (!isNaN(srcdata[0][1]) && !isNaN(srcdata[0][0]))
    ctx.moveTo(srcdata[0][0], srcdata[0][1]);
  for (var i = 0; i < srcdata.length; i += delta) {
    //console.log(srcdata[i] + " " +srcdata[i][0] + " " + srcdata[i][1]);
    if (isNaN(srcdata[i][1]) || isNaN(srcdata[i][0])) {
      nan = true;
      continue;
    }
    if (nan == true) {
      ctx.moveTo(srcdata[i][0], srcdata[i][1]);
      nan = false;
    }
    if (!util.isVaild(srcdata[i][0]) || !util.isVaild(srcdata[i][0])) {
      continue;
    }
    if (!modeSwitch){
      ctx.lineTo(srcdata[i][0], srcdata[i][1]);
    }else{
      ctx.moveTo(srcdata[i][0], srcdata[i][1])
      ctx.arc(srcdata[i][0], srcdata[i][1], 0.5, 0, 2 * Math.PI, true);
    }
  }
  ctx.stroke();
  ctx.restore();
  //console.log(ctx);
}

function update(ctx, srcdata, color) {
  draw(ctx, srcdata, color);
  util.move(srcdata);
  ctx.stroke();
}

function drag(srcdata, moveArray) {
  if (moveArray.length != 0) {
    var m = [
      moveArray[0][0] - moveArray[moveArray.length - 1][0],
      moveArray[0][1] - moveArray[moveArray.length - 1][1]];
    //console.log(m);
    util.move(srcdata, m);
    //moveArray.length = 0; 
    origin[0] -= m[0]
    origin[1] -= m[1]
    if (gridSwitch) {
      grid(context, origin);
    }
    draw(context, srcdata, oldcolor);
    context.draw();
  }
}

//coordinate system; frame of axes;
function grid(ctx, originpoint) {
  ctx.save();
  ctx.beginPath();
  ctx.setStrokeStyle("gray");
  ctx.setLineWidth(1);
  //origin point
  ctx.setFontSize(13)
  ctx.setFillStyle("black");

  var rdx = data[2][2][0] - data[0][2][0];
  var dx = data[2][0] - data[0][0]
  var xunit = Math.abs(unit * dx / rdx);

  var rdy = data[2][2][1] - data[0][2][1];
  var dy = data[2][1] - data[0][1]
  var yunit = Math.abs(unit * dy / rdy)
  if (isNaN(yunit)) { yunit = xunit };

  //x-axes
  var sx = Math.abs(originpoint[0] - parseInt(originpoint[0] / xunit) * xunit);
  var rsx = -parseInt(originpoint[0] / xunit);
  var i = 0
  while (sx < canvasW) {
    rsx += unit
    sx += xunit;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, canvasH);
    ctx.fillText("" + rsx, sx - 6.5, canvasH - 13);
  }
  //y-axes
  i = 0;
  var sy = Math.abs(originpoint[1] - parseInt(originpoint[1] / yunit) * yunit);
  if (isNaN(sy)) { sy = sx }
  var rsy = parseInt(originpoint[1] / yunit);
  if (isNaN(rsy)) { rsy = rsx }
  while (sy < canvasH) {
    ctx.moveTo(0, sy);
    ctx.lineTo(canvasW, sy);
    ctx.fillText("" + rsy, 9, sy + 6);
    rsy -= unit
    sy += yunit;
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  //x-axes
  ctx.setStrokeStyle("#000000");
  ctx.setLineWidth(2);
  ctx.moveTo(0, originpoint[1]);
  ctx.lineTo(canvasW, originpoint[1]);
  //y-axes
  ctx.moveTo(originpoint[0], 0);
  ctx.lineTo(originpoint[0], canvasH);
  ctx.closePath()
  ctx.stroke();
  ctx.restore();
}

function example(ctx) {
  ctx.setStrokeStyle("#00ff00");
  ctx.setLineWidth(1);
  ctx.rect(0, 0, 300, 300);
  ctx.stroke()
  ctx.setStrokeStyle("#ff0000");
  ctx.setLineWidth(2)
  ctx.moveTo(160, 100)
  ctx.arc(100, 100, 60, 0, 2 * Math.PI, true);
  ctx.moveTo(140, 100);
  ctx.arc(100, 100, 40, 0, Math.PI, false);
  ctx.moveTo(85, 80);
  ctx.arc(80, 80, 5, 0, 2 * Math.PI, true);
  ctx.moveTo(125, 80);
  ctx.arc(120, 80, 5, 0, 2 * Math.PI, true);
  ctx.stroke();
}

function getPosition(e) {
  //console.log(e.touches[0].x,e.touches[0].y);
  //return [e.touches[0].x, e.touches[0].y];
  return [e.changedTouches[0].x, e.changedTouches[0].y];
}

function trace(ctx, position) {
  ctx.save();
  // ctx.beginPath();
  // //x-axes
  // ctx.setStrokeStyle("#000000");
  // ctx.setLineWidth(1);
  // ctx.moveTo(0, position[1]);
  // ctx.lineTo(canvasW, position[1]);
  // //y-axes
  // ctx.moveTo(position[0], 0);
  // ctx.lineTo(position[0], canvasH);
  // ctx.closePath()
  // ctx.stroke();
  ctx.beginPath();
  ctx.setFillStyle(oldcolor);
  ctx.setLineWidth(1);
  //join is current touch point and math function image join point
  var join = (position[0] - origin[0]) / scale;
  var calcData = Calcer.calcs(input, [join, join]);
  //maybe return NaN, if NaN will show NaN and draw a point top of canvas
  ctx.arc(position[0], origin[1] - calcData * scale, 3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.draw();
  return [join, calcData];
}

function onPlot(ctx) {
  input = ctx.data.functions;
  if ("" != input) {
    if (data instanceof Array)
      data.length = 0;
    data = Calcer.calcs(input, ctx.data.arange);
    if (data != undefined || data != null) {
      origin = [canvasW / 2, canvasH / 2];
      scale = util.selfAdapter(data, origin, canvasW, canvasH);
      if (gridSwitch) {
        grid(context, origin);
      }      
      draw(context, data, "#ff0000");
      context.draw();
      ploted = true;
    }
  } else {
    context.clearRect(0, 0, canvasW, canvasH);
    context.draw();
  }
  ctx.setData({
    canvasStatus: "flex",
    resultStatus: "flex",
    SolveResult: input + " ←:[" + ctx.data.arange.toString() + "]"
  });
}
Page({
  data: {
    canvasWidth: "0",
    canvasHeight: "0",
    lazytime: "500",
    btctrl: "START",
    functions: "",
    arange: null,
    inputHeight: "",
    SolveResult: "",
    canvasTouchPosition: "",
    tipTop: "0",
    tipLeft: "0",
    lastTapTime: '0',
    resultStatus: "none",
    canvasStatus: "none",
    tipStatus: "none",
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function (e) {
    // console.log("drawer is onload...")
    var W = 0;
    var H = 0;
    wx.getSystemInfo({
      success: function (res) {
        W = res.windowWidth;
        H = res.windowHeight;
        /*
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
        */
      }
    })
    var out = util.dealInput(e.input);
    if (null == out.arange) {
      out.arange = [-5, 5];
    }
    this.setData({
      functions: out.method,
      arange: out.arange,
      inputHeight: H * 0.15,
      canvasWidth: W * 0.9,
      canvasHeight: H * 0.8
    });
    this.setData({
      canvasHeight: H * 0.8
    });
    canvasW = this.data.canvasWidth;
    canvasH = this.data.canvasHeight;
  },
  onReady: function (e) {
    // console.log("canvas is ready...")
    //使用wx.createContext获取绘图上下文context
    context = wx.createCanvasContext('firstCanvas');
    context.setStrokeStyle("rgba(0,255,0)");
    origin = [canvasW / 2, canvasH / 2];
    onPlot(this);
  },
  onHide: function () {
    // 页面隐藏
    // console.log("drawer is onHide...")
  },
  onUnload: function () {
    // 页面关闭
    wx.clearStorage();
    // console.log("drawer is onUnload...")
  },
  onLockCanvas: function (e) {
    var curTime = e.timeStamp;
    var lastTime = this.data.lastTapTime;
    if (lastTime > 0) {
      var pressTime = curTime - lastTime
      if (pressTime < 300) {
        // console.log("double click " + curTime);
        if (locked == false) {
          locked = true;
          wx.showToast({
            title: 'In Trace Mode',
            duration: 1000
          })
          this.setData({
            tipStatus: "flex"
          });
        } else {
          locked = false;
          moveArray.length = 0;
          this.setData({
            tipStatus: "none"
          });
          wx.showToast({
            title: 'Out Trace Mode',
            duration: 1000
          })
        }
      } else {
        // console.log("click " + curTime);
      }
    } else {
      // console.log("first click " + curTime);
    }
    this.setData({
      lastTapTime: curTime
    });
  },
  startDraw: function (e) {
    var status = this.data.btctrl;
    //console.log("current status: " + status);
    if (status == "START") {
      this.setData({
        btctrl: "STOP"
      });
      context.clearActions();
      timer = setInterval(function () {
        update(context, data, "#ff0000");
        context.draw(false);
        update(context, data2, "#ff00ff");
        context.draw(true);
        //调用wx.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为       
      }, this.data.lazytime);
    } else {
      this.setData({
        btctrl: "START"
      });
      clearInterval(timer);
    }
  },
  fastTimer: function () {
    if (this.data.btctrl == "START") {
      this.setData({
        lazytime: this.data.lazytime -= 50
      });
    }
    // console.log("lazytime: " + this.data.lazytime + " " + this.data.btctrl);
  },
  slowTimer: function () {
    if (this.data.btctrl == "START") {
      this.setData({
        lazytime: this.data.lazytime += 50
      });
    }
    // console.log("lazytime: " + this.data.lazytime);
  },
  touchStart: function (e) {
    var pos = getPosition(e);
    if (!locked) {
      moveArray.push(pos);
    } else {
      draw(context, data, oldcolor);
      if (gridSwitch) { grid(context, origin); }
      var realpos = trace(context, pos);
      this.setData({
        canvasTouchPosition: "x: " + realpos[0].toFixed(2) + " y: " + realpos[1].toFixed(2),
        tipLeft: pos[0],
        tipTop: pos[1] + this.data.inputHeight + 98
      });
    }
    //console.log("Touch Start... " + pos[0], pos[1]);
  },
  touchMove: function (e) {
    var pos = getPosition(e);
    if (!locked) {
      moveArray.push(pos);
      drag(data, moveArray);
      moveArray.shift();
    } else {
      draw(context, data, oldcolor);
      if (gridSwitch) { grid(context, origin); }
      var realpos = trace(context, pos);
      this.setData({
        canvasTouchPosition: "x: " + realpos[0].toFixed(2) + " y: " + realpos[1].toFixed(2),
        tipLeft: pos[0],
        tipTop: pos[1] + this.data.inputHeight + 98
      });
    }
    //console.log("Touch Move... " + pos[0], pos[1], this.data.inputHeight);
    //console.log(e);
  },
  longTap: function (e) {
    // console.log(e.timeStamp + '- long tap');
    wx.canvasToTempFilePath({
      canvasId: 'firstCanvas',
      success: function success(res) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function success(res) {
            console.log('saved::' + res.savedFilePath);
          },
          complete: function fail(e) {
            console.error(e.errMsg);
          }
        });
      },
      complete: function complete(e) {
        console.error(e.errMsg);
      }
    });
  },
  touchEnd: function (e) {
    //console.log(e);
    var pos = getPosition(e);
    if (!locked) {
      moveArray.push(pos);
      drag(data, moveArray);
      moveArray.shift();
      moveArray.length = 0;
    }
    //console.log("Touch End... " + pos[0], pos[1]);
  },
  gridSwitch: function () {
    gridSwitch = !gridSwitch;
    if (gridSwitch) {
      grid(context, origin);
      context.draw(true);
    } else {
      context.clearRect(0, 0, canvasW, canvasH);
      draw(context, data, oldcolor);
      context.draw();
    }
  },
  modeSwitch: function () {
    modeSwitch = !modeSwitch;
  }
});
