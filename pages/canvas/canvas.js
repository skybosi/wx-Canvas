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
var origin = [0, 0, [0, 0]];
var canvasW = 0;
var canvasH = 0;
var oldcolor;
var gridSwitch = false;
var input = "";
var scale = 1.0;
//draw line each point
function draw(ctx, srcdata, color) {
  if (color == undefined) {
    //color = "black";
    color = oldcolor;
  }
  ctx.save();
  ctx.beginPath();
  ctx.setStrokeStyle(color);
  oldcolor = color;
  //console.log("srcdata: " + srcdata);
  if (!isNaN(srcdata[0][1]) && !isNaN(srcdata[0][0]))
    ctx.moveTo(srcdata[0][0], srcdata[0][1]);
  for (var i = 0; i < srcdata.length; i++) {
    //console.log(srcdata[i] + " " +srcdata[i][0] + " " + srcdata[i][1]);
    if (isNaN(srcdata[i][1]) || isNaN(srcdata[i][0]))
      continue;
    ctx.lineTo(srcdata[i][0], srcdata[i][1]);
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
    //var oldcolor = getbrushColor(context);
    draw(context, srcdata, oldcolor);
    origin[0] -= m[0]
    origin[1] -= m[1]
    if (gridSwitch) {
      grid(context, origin);
    }
    context.draw();
  }
}

//coordinate system; frame of axes;
function coordSys(ctx, originpoint) {
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
  //origin point
  ctx.setFontSize(13)
  ctx.setFillStyle("black");
  //ctx.fillText("O",originpoint[0]+3,originpoint[1]-3)
  /*
  var xunit = data[9][0] - data[0][0];
  var i = 0;
  while (xunit*i < canvasW) {
    ctx.fillText(""+data[i][2][0],data[i][0]-3,canvasH-13);
    i+=10;
  }*/
  for (var i = 0; i < data.length; ++i) {
    if (i % 10 == 0) {
      ctx.fillText("" + data[i][2][0], data[i][0] - 6.5, canvasH - 13);
      //ctx.fillText(""+data[i][2][0],13,data[i][0]+originpoint[1]/2);
    }
  }
  ctx.stroke();
  ctx.restore();
}

function grid(ctx, originpoint) {
  ctx.save();
  ctx.beginPath();
  ctx.setStrokeStyle("gray");
  ctx.setLineWidth(0.5);
  var gridW = Math.ceil(canvasW / 30);
  var gridH = Math.ceil(canvasH / 30);
  //横线
  for (var x = 0; x < 30; ++x) {
    ctx.moveTo(0, x * gridH);
    ctx.lineTo(canvasW, x * gridH);
  }
  //纵线
  for (var y = 0; y < 30; ++y) {
    ctx.moveTo(y * gridW, 0);
    ctx.lineTo(y * gridW, canvasH);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  coordSys(ctx, originpoint);
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
  ctx.setStrokeStyle("#00FF00");
  ctx.setLineWidth(1);
  //join is current touch point and math function image join point
  var join = (position[0] - origin[0]) / scale;
  var calcData = Calcer.calcs(input, [join, join]);
  ctx.arc(position[0], origin[1] - calcData * scale, 3, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.draw();
  return [join, calcData];
}

Page({
  data: {
    canvasWidth: "0",
    canvasHeight: "0",
    lazytime: "500",
    btctrl: "START",
    inputString: "",
    inputHeight: "",
    SolveResult: "",
    canvasTouchPosition: "",
    tipTop: "0",
    tipLeft: "0",
    lastTapTime: '0',
    resultStatus: "none",
    canvasStatus: "none",
    tipStatus: "none"
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function (e) {
    console.log("canvas is onload...")
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
    this.setData({
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
    console.log("canvas is ready...")
    //使用wx.createContext获取绘图上下文context
    context = wx.createCanvasContext('firstCanvas');
    context.setStrokeStyle("rgba(0,255,0)");
    [origin[0], origin[0]] = [canvasW / 2, canvasH / 2];
  },
  onSolve: function (e) {
    input = this.data.inputString;
    if (input.length == 0) {
      this.setData({
        resultStatus: "none",
      });
      return;
    }
    var result = Calcer.calc(input);
    this.setData({
      resultStatus: "flex",
      SolveResult: result
    });
  },
  bindChange: function (e) {
    input = e.detail.value = util.trim(e.detail.value.toLowerCase());
    if (input.length == 0) {
      this.setData({
        resultStatus: "none",
      });
      return;
    }
    this.setData({
      inputString: input
    });
    var result = Calcer.calc(input);
    this.setData({
      resultStatus: "flex",
      SolveResult: result
    });
  },
  onPlot: function () {
    this.setData({
      canvasStatus: "flex"
    });
    input = this.data.inputString;
    if (data instanceof Array)
      data.length = 0;
    data = Calcer.calcs(input, [-5, 10]);
    [origin[0], origin[1]] = [canvasW / 2, canvasH / 2];
    scale = util.selfAdapter(data, origin, canvasW, canvasH);
    draw(context, data, "#ff0000");
    if (gridSwitch) {
      grid(context, origin);
    }
    context.draw();
    ploted = true;
  },
  onLockCanvas: function (e) {
    var curTime = e.timeStamp;
    var lastTime = this.data.lastTapTime;
    if (lastTime > 0) {
      var pressTime = curTime - lastTime
      if (pressTime < 300) {
        console.log("double click " + curTime);
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
        console.log("click " + curTime);
      }
    } else {
      console.log("first click " + curTime);
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
    console.log("lazytime: " + this.data.lazytime + " " + this.data.btctrl);
  },
  slowTimer: function () {
    if (this.data.btctrl == "START") {
      this.setData({
        lazytime: this.data.lazytime += 50
      });
    }
    console.log("lazytime: " + this.data.lazytime);
  },
  touchStart: function (e) {
    var pos = getPosition(e);
    if (!locked) {
      moveArray.push(pos);
    } else {
      draw(context, data, oldcolor);
      grid(context, origin);
      var realpos = trace(context, pos);
      this.setData({
        canvasTouchPosition: " (x: " + realpos[0].toFixed(2) + ",y: " + realpos[1].toFixed(2) + ")",
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
      grid(context, origin);
      var realpos = trace(context, pos);
      this.setData({
        canvasTouchPosition: " (x: " + realpos[0].toFixed(2) + ",y: " + realpos[1].toFixed(2) + ")",
        tipLeft: pos[0],
        tipTop: pos[1] + this.data.inputHeight + 98
      });
    }
    //console.log("Touch Move... " + pos[0], pos[1], this.data.inputHeight);
    // this.setData({
    //   canvasTouchPosition: " (x: " + pos[0] + ", y: " + pos[1] + ")",
    //   tipLeft: pos[0],
    //   tipTop: pos[1] + this.data.inputHeight + 98
    // });
    //console.log(e);
  },
  longTap: function (e) {
    console.log(e.timeStamp + '- long tap');
    wx.canvasToTempFilePath({
      canvasId: 'firstCanvas',
      success: function success(res) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function success(res) {
            console.log('saved::' + res.savedFilePath);
          },
          complete: function fail(e) {
            console.log(e.errMsg);
          }
        });
      },
      complete: function complete(e) {
        console.log(e.errMsg);
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
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
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
  }
});