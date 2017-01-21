var app = getApp();
var reader = require("../../utils/reader.js");
var Data = require("../../data/data.js");
var cpuData = Data.data.cpu.slice();
;
var timer = null;
function draw(ctx, origin, data, color) {
  if (color == undefined) {
    color = "black";
  }
  ctx.setStrokeStyle(color);
  //console.log("origin: " + origin);
  //console.log("data: " + data);
  //ctx.quadraticCurveTo(origin[0],origin[1],data[0][0],data[0][1]);
  //ctx.moveTo(origin[0], origin[1]);
  var i = 0;
  for (; i < data.length; i++) {
    //console.log(data[i] + " " + data[i][0] + " " + data[i][1]);
    //ctx.quadraticCurveTo(origin[0]+data[i][0],data[i][1],origin[0]+data[i+1][0],data[i+1][1])
    ctx.lineTo(origin[0] + data[i][0], origin[1] + data[i][1]);
  }
  //console.log(ctx);
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

function getPosition(e)
{
  console.log("getPositon:")
  //console.log(e.touches[0].x,e.touches[0].y);
  return [e.touches[0].x,e.touches[0].y];
}

Page({
  data: {
    canvasWidth: "300",
    canvasHeight: "300",
    lazytime: "100",
    btctrl: "START",
    inputShow: "",
    canvasTouchPosition:""
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onReady: function (e) {
    console.log("canvas is ready...")
  },
  startDraw: function () {
    var status = this.data.btctrl;
    //console.log("current status: " + status);
    if (status == "START") {
      this.setData({
        btctrl: "STOP"
      });
      var cw = this.data.canvasWidth;
      var ch = this.data.canvasHeight;
      //使用wx.createContext获取绘图上下文context
      var context = wx.createContext();
      context.setStrokeStyle("rgba(0,255,0)");
      //show example
      //example(context);
      //context.clear
      //init data
      var data = [];
      for (var x = 0; x <= 15; x = x + 0.1) {
        data.push([x * 20, 2 * Math.sin(x) * 20]);
      }
      //draw data
      //draw(context, [0, ch / 3], data);
      var data2 = [];
      timer = setInterval(function () {
        for (var i = 0; i < cpuData.length; i++) {
          data2.push([i * 5, cpuData[i]]);
        }
        draw(context, [0, ch / 3], data2, "green");
        context.stroke();
        //调用wx.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为
        wx.drawCanvas({
          canvasId: 'firstCanvas',
          actions: context.getActions() //获取绘图动作数组
        });
        data2.length = 0;
        cpuData.shift();
        if (cpuData.length == 60) {
          cpuData = cpuData.concat(Data.data.cpu);
          ;
          console.log("Data concat len: " + cpuData.length);
          //clearInterval(timer);
        }
      }, this.data.lazytime);
    } else {
      this.setData({
        btctrl: "START"
      });
      clearInterval(timer);
    }
  },
  fastTimer: function () {
    this.setData({
      lazytime: this.data.lazytime -= 10
    });
    //this.data.lazytime -= 10;
    console.log("lazytime: " + this.data.lazytime);
  },
  slowTimer: function () {
    this.setData({
      lazytime: this.data.lazytime += 10
    });
    console.log("lazytime: " + this.data.lazytime);
  },
  bindChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      inputShow: e.detail.value
    });
  },
  touchStart: function (e) {
    console.log("Touched...");
    var pos = getPosition(e);
    console.log(pos[0],pos[1]);
        this.setData({
      canvasTouchPosition:" (x: " + pos[0] + ",y: " + pos[1] + ")"
    });
    console.log(e);
  },
  touchMove: function (e) {
    console.log("Touch Move... ");
    var pos = getPosition(e);
    console.log(pos[0], pos[1]);
    this.setData({
      canvasTouchPosition: " (x: " + pos[0] + ", y: " + pos[1]+ ")"
    });
    console.log(e);
  },
  touchEnd: function (e) {
    console.log("Touch  end... ");
    console.log(e);
  }
});