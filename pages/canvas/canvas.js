var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../lib/expression.js");
var cpuData = Data.data.cpu.slice();
var timer = null;
var ploted = false;
var moveArray = [];
var data = [];
var data2 = [];
var context;
var origin = [0,0];
var canvasW = 0;
var canvasH = 0;
var oldcolor;
//draw line each point
function draw(ctx,srcdata, color) {
  if (color == undefined) {
    //color = "black";
    color = oldcolor;
  }
  //clearbrushColor(ctx);
  ctx.setStrokeStyle(color);
  oldcolor = color;
  //console.log("srcdata: " + srcdata);
  if(!isNaN(srcdata[0][1]) && !isNaN(srcdata[0][0]))
   ctx.moveTo(srcdata[0][0],srcdata[0][1]);
  for (var i = 0; i < srcdata.length; i++) {
    //console.log(srcdata[i] + " " +srcdata[i][0] + " " + srcdata[i][1]);
    if(isNaN(srcdata[i][1]) || isNaN(srcdata[i][0]))
      continue;
    ctx.lineTo(srcdata[i][0], srcdata[i][1]);
  }
  ctx.stroke();
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
    console.log(m);
    util.move(srcdata, m);
    //moveArray.length = 0;
    //var oldcolor = getbrushColor(context);
    draw(context, srcdata, oldcolor);
    context.draw();
  }
}

function clearbrushColor(context) {
  var actions = context.actions;
  var len = actions.length;
  for (var i = 0; i < len; ++i) {
    if (actions[i].method == "setStrokeStyle") {
      actions.splice(i, 1);
      i = -1;
      len--;
    }
  }
}

function getbrushColor(context) {
  var actions = context.actions;
  var len = actions.length;
  for (var i = len - 1; i >= 0; --i) {
    if (actions[i].method == "setStrokeStyle") {
      return actions[i].data[1];
    }
  }
}

function grid(context, origin) {
  //clearbrushColor(context);
  context.setStrokeStyle("#000000");
  var gridW = Math.ceil(canvasW / 30);
  var gridH = Math.ceil(canvasH / 30);
  //横线
  for (var x = 0; x < 30; ++x) {
    context.moveTo(0, x * gridH);
    context.lineTo(canvasW, x * gridH);
  }
  //纵线
  for (var y = 0; y < 30; ++y) {
    context.moveTo(y * gridW, 0);
    context.lineTo(y * gridW, canvasH);
  }
  context.stroke();
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

Page({
  data: {
    canvasWidth: "0",
    canvasHeight: "0",
    lazytime: "500",
    btctrl: "START",
    inputString: "",
    inputHeight: "",
    SolveResult:"",
    canvasTouchPosition: "",
    tipTop:"0",
    tipLeft:"0",
    lastTapTime: '0',
    resultStatus:"none",
    canvasStatus: "none",
    tipStatus:"none"
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
    origin = [canvasW / 2, canvasH / 2];
  },
  onSolve: function (e) {
    var input = this.data.inputString;
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
    var input = e.detail.value = util.trim(e.detail.value.toLowerCase());
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
    var input = this.data.inputString;
    data.length = 0;
    data = Calcer.calcs(input,[-5,5]);
    util.selfAdapter(data,origin,canvasW, canvasH);
    draw(context, data, "#ff0000");
    context.draw();
    grid(context,origin);
    context.draw();
    ploted = true;
  },
  onLockCanvas: function (e) {
    var cutTime = e.timeStamp;
    var lastTime = this.data.lastTapTime;
    if (lastTime > 0) {
      if (cutTime - lastTime < 300) {
        console.log("double click " + cutTime);
        if (ploted == true) {
          ploted = false;
          this.setData({
            tipStatus: "flex"
          });
        } else {
          ploted = true;
          this.setData({
            tipStatus: "none"
          });
        }
      } else {
        console.log("click " + cutTime);
      }
    } else {
      console.log("first click " + cutTime);
    }
    this.setData({
      lastTapTime: cutTime
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
    this.setData({
      canvasTouchPosition: " (x: " + pos[0] + ",y: " + pos[1] + ")",
      tipLeft:pos[0],
      tipTop:pos[1] + this.data.inputHeight + 98
    });
    if (ploted) {
      moveArray.push(pos);
    }
    console.log("Touch Start... " + pos[0], pos[1]);
    //console.log(e);
  },
  touchMove: function (e) {
    var pos = getPosition(e);
    if (ploted) {
      moveArray.push(pos);
      drag(data, moveArray);
      moveArray.shift();
    }
    console.log("Touch Move... " + pos[0], pos[1],this.data.inputHeight);
    this.setData({
      canvasTouchPosition: " (x: " + pos[0] + ", y: " + pos[1] + ")",
      tipLeft: pos[0],
      tipTop: pos[1] + this.data.inputHeight + 98
    });
    //console.log(e);
  },
  touchEnd: function (e) {
    //console.log(e);
    var pos = getPosition(e);
    if (ploted) {
      moveArray.push(pos);
      drag(data, moveArray);
      moveArray.shift();
      moveArray.length = 0;
    }
    console.log("Touch End... " + pos[0], pos[1]);
  },
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
  }
});