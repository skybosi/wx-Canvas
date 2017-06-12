var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../lib/expression.js");
var gridSwitch = false;
var input = "";
var currpage = [0, 0]
var prevpage = [0, 0]
var Page_Switch_Sensitivity = 50
var Fonts_Size = 10
var iReg = null
var curi = 1;
var a = 8  //padding left
var b = Fonts_Size
Array.prototype.indexof = function (value) {
  var that = this || [];
  for (var i = 0; i < that.length; i++) {
    if (that[i] == value)
      return i;
  }
  return -1;
}
function getPosition(e) {
  //console.log(e.touches[0].x,e.touches[0].y);
  //return [e.touches[0].x, e.touches[0].y];
  return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
}

Page({
  data: {
    inputString: "",
    resultStatus: "none",
    SolveResult: "",
    cursor: 0,
    animation: '',
    animationData: {},
    curinputlen: a,
    commonIds: ["Enter", "Plot", "Solve", "Del"],
    kyboardIds: [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';',
      'z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', '?',
      "shiht", 'Enter', '', "shift"],
    basekeyIds: [
      "sin", "x", "1", "2", "3", "/", "()",
      "cos", "y", "4", "5", "6", "*", "^",
      "tan", "T", "7", "8", "9", "-", "sqrt",
      "ln", "=", ",", "0", ".", "+", "[]"]
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function (e) {
    wx.hideKeyboard();
    iReg = new RegExp('(.{0})');
    this.data.animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'easy',
    })
    this.setData({
      animationData: this.data.animation.export()
    })
    console.log("calcer is onload...")
    this.data.kyboardIds = this.data.commonIds.concat(this.data.kyboardIds);
    this.data.basekeyIds = this.data.commonIds.concat(this.data.basekeyIds);
  },
  onReady: function (e) {
    console.log("calcer is ready...")
    var self = this;
  },
  onShow: function () {
    console.log("calcer is onShow...")
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
    console.log("calcer is onHide...")
  },
  onUnload: function () {
    // 页面关闭
    console.log("calcer is onUnload...")
  },
  onSolve: function (e) {
    input = this.data.inputString;
    if (input.length == 0) {
      this.setData({
        resultStatus: "none",
        inputString: ""
      });
      return;
    }
    var result = Calcer.calc(input);
    this.setData({
      resultStatus: "flex",
      SolveResult: result
    });
  },
  onPlot: function () {
    input = this.data.inputString;
    var result = this.data.SolveResult
    if ("" != result && !isNaN(parseFloat(result))) {
      input = parseFloat(result);
    } else if ("" == input || "null" == result.toLowerCase() || "undefined" == result.toLowerCase() || "Syntax Error" == result) {
      return;
    }
    wx.navigateTo({
      url: '../drawer/drawer?input=' + input,
      success: function (res) {
        // success
        console.log('onBtnClick success() res:');
      },
      fail: function (e) {
        // fail
        console.log('onBtnClick fail() !!!');
      },
      complete: function (e) {
        console.log('onBtnClick complete() !!!');
        // complete
      }
    })
  },
  bindinput: function (e) {
    iReg = new RegExp('(.{' + (this.data.cursor) + '})');
    wx.hideKeyboard();
  },
  bindchange: function (e) {
    wx.hideKeyboard();
  },
  bindfocus: function (e) {
    wx.hideKeyboard();
  },
  bindblur: function (e) {
    wx.hideKeyboard();
  },
  bclick: function (e) {
    console.log(e.target.id);
    var id = e.target.id;
    var index = this.data.basekeyIds.indexof(id)
    if (index == -1) { index = this.data.kyboardIds.indexof(id); }
    var input = null;
    iReg = new RegExp('(.{' + (this.data.cursor) + '})');
    if (null != iReg) {
      input = this.data.inputString.replace(iReg, '$1' + id);
      iReg = null;
    } else {
      input = this.data.inputString + id;
    }
    if (index > 3) {
      var cur = (curi - 1) * Fonts_Size;
      this.data.animation = this.data.animation.translateX(cur).step()
      this.setData({
        inputString: input,
        curinputlen: a + b * input.length,
        cursor: input.length,
        animationData: this.data.animation.export()
      });
      curi = 1;
    } else {
      switch (id) {
        case "Del":
          this.setData({
            inputString: this.data.inputString.slice(0, -1),
            SolveResult: ""
          });
          break;
        case "Plot":
          this.onPlot();
          break;
        case "Solve":
          this.onSolve();
          break;
        case "←":
          var cur = ((curi++) % (this.data.inputString.length)) * (-Fonts_Size);
          this.data.animation = this.data.animation.translateX(cur).step()
          this.setData({
            animationData: this.data.animation.export(),
            cursor: --this.data.cursor,
          })
          break;
        case "ctrl":
          var types = (++this.data.TYPE) % 3;
          this.setData({
            TYPE: types,
            SolveResult: ""
          });
          break;
        default:
          break;
      }
    }
    console.log("animation" + this.data.animation);
  },
  bindTextAreaFocus: function (e) {
    var curX = e.detail.x;
    var cur = -(this.data.curinputlen - Math.floor((curX - a) / (2 * b)) * b);
    this.data.animation = this.data.animation.translateX(cur).step()
    this.setData({
      animationData: this.data.animation.export(),
      cursor: --this.data.cursor,
    })
    console.log('bindTextAreaFocus =' + e)
  },
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
  },
});
