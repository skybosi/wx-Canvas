var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../lib/expression.js");
var gridSwitch = false;
var input = "";
var currpage = [0, 0]
var prevpage = [0, 0]
var Page_Switch_Sensitivity = 50
var iReg = null

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
    ids: ["Enter", "Plot", "Solve", "Del",
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
    console.log("calcer is onload...")
  },
  onReady: function (e) {
    console.log("calcer is ready...")
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
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
    wx.vibrateShort({
      success: function (e) {
        // success
        console.log('brate success() e:' + e);
      },
      fail: function (e) {
        // fail
        console.log('brate fail() !!!');
      },
      complete: function (e) {
        console.log('brate complete() !!!');
        // complete
      }
    })
    console.log(e.target.id);
    var id = e.target.id;
    var index = this.data.ids.indexof(id);
    var input = null;
    iReg = new RegExp('(.{' + (this.data.cursor) + '})');
    if (null != iReg) {
      input = this.data.inputString.replace(iReg, '$1' + id);
      iReg = null;
    } else {
      input = this.data.inputString + id;
    }
    if (index > 3) {
      this.setData({
        inputString: input,
        cursor: input.length
      });
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
          this.setData({
            curcor: --this.data.cursor,
          });
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
  },
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
  },
});
