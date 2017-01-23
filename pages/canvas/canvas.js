var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var RPNer = require("../../lib/expression.js");
var cpuData = Data.data.cpu.slice();
var timer = null;
var ploted = false;
var moveArray = [];
var data = [];
var data2 = [];
var context;
var origin;
//draw line each point
function draw(ctx, origin, srcdata, color) {
  if (color == undefined) {
    color = "black";
  }
  ctx.setStrokeStyle(color);
  //console.log("origin: " + origin);
  //console.log("srcdata: " + srcdata);
  //ctx.quadraticCurveTo(origin[0],origin[1],srcdata[0][0],srcdata[0][1]);
  ctx.moveTo(origin[0] + srcdata[0][0], origin[1] + srcdata[0][1]);
  var i = 0;
  for (; i < srcdata.length; i++) {
    //console.log(srcdata[i] + " " +srcdata[i][0] + " " + srcdata[i][1]);
    //ctx.quadraticCurveTo(origin[0]+srcdata[i][0],srcdata[i][1],origin[0]+srcdata[i+1][0],srcdata[i+1][1])
    ctx.lineTo(origin[0] + srcdata[i][0], origin[1] + srcdata[i][1]);
  }
  ctx.stroke();
  //console.log(ctx);
}

function update(ctx, origin, srcdata, color) {
  draw(ctx, origin, srcdata, color);
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
    draw(context, origin, srcdata);
    context.draw();
  }
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
    inputShow: "",
    canvasTouchPosition: "",
    lastTapTime: '0'
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function () {
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
      canvasWidth: W * 0.8
    });
    this.setData({
      canvasHeight: H * 0.8
    });
    /*
    var context = wx.createContext();
    var gridW = Math.ceil(W / 30);
    var gridH = Math.ceil(H / 30);
    //横线
    for (var x = 0; x < 30; ++x) {
      context.moveTo(0, x * gridH);
      context.lineTo(W, x * gridH);
    }
    //纵线
    for (var y = 0; y < 30; ++y) {
      context.moveTo(y * gridW, 0);
      context.lineTo(y * gridW, H);
    }
    context.stroke();
    wx.drawCanvas({
      canvasId: 'firstCanvas',
      actions: context.getActions() //获取绘图动作数组
    });
    */
  },
  onReady: function (e) {
    console.log("canvas is ready...")
    //使用wx.createContext获取绘图上下文context
    //context = wx.createContext();
    context = wx.createCanvasContext('firstCanvas');
    context.setStrokeStyle("rgba(0,255,0)");
    var cw = this.data.canvasWidth;
    var ch = this.data.canvasHeight;
    origin = [0, ch / 2];
    for (var x = 0; x <= 30; x = x + 0.1) {
      data.push([x, 3 * Math.sin(x)]);
    }
    for (var x = 0; x <= 30; x = x + 0.1) {
      data2.push([x, 2 * Math.cos(x)]);
    }
    util.selfAdapter(data, cw, ch);
    util.selfAdapter(data2, cw, ch);
  },
  onPlot: function () {
    draw(context, origin, data, "#ff0000");
    context.draw(true);
    ploted = true;
  },
  onLockCanvas: function (e) {
    var cutTime = e.timeStamp;
    var lastTime = this.data.lastTapTime;
    if (lastTime > 0) {
      if (cutTime - lastTime < 300) {
        console.log("double click " + cutTime);
        ploted = false;
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
        update(context, origin, data, "#ff0000");
        context.draw(false);
        update(context, origin, data2, "#ff00ff");
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
  bindChange: function (e) {
    e.detail.value = util.trim(e.detail.value);
    console.log(e.detail.value + " = " + RPNer.parser(e.detail.value));
    this.setData({
      inputShow: e.detail.value
    });
  },
  touchStart: function (e) {
    var pos = getPosition(e);
    this.setData({
      canvasTouchPosition: " (x: " + pos[0] + ",y: " + pos[1] + ")"
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
    console.log("Touch Move... " + pos[0], pos[1]);
    this.setData({
      canvasTouchPosition: " (x: " + pos[0] + ", y: " + pos[1] + ")"
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
  }
});