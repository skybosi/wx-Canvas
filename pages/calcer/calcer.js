var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../lib/expression.js");
var gridSwitch = false;
var input = "";
var placeholder = '|';
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

function getPosition(e) {
  //console.log(e.touches[0].x,e.touches[0].y);
  //return [e.touches[0].x, e.touches[0].y];
  return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
}

Page({
  data: {
    inputString: placeholder,
    resultStatus: "none",
    SolveResult: "",
    cursor: 0,
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
    input = this.data.inputString.replace(placeholder, '');
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
    input = this.data.inputString.replace(placeholder, '');
    var result = this.data.SolveResult
    if ("" != result || "" == input || "null" == result.toLowerCase() || "undefined" == result.toLowerCase() || "Syntax Error" == result) {
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
  bindconfirm: function (e) {
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
      this.setData({
        inputString: input,
        cursor: this.data.cursor + id.length,
      });
    } else {
      switch (id) {
        case "Del":
          var pos = this.data.cursor - 1;
          if (pos >= 0) {
            this.setData({
              inputString: this.data.inputString.del(pos),
              cursor: --this.data.cursor,
              SolveResult: ""
            });
          }
          break;
        case "Plot":
          this.onPlot();
          break;
        case "Solve":
          this.onSolve();
          break;
        case "←":
          var pos = this.data.cursor;
          var ninput = ""
          if (pos > 0) {
            --pos;
            ninput = this.data.inputString.swap(pos + 1, pos);
          } else {
            ninput = this.data.inputString;
          }
          this.setData({
            inputString: ninput,
            cursor: pos,
            SolveResult: ""
          });
          break;
        case "→":
          var pos = this.data.cursor;
          var ninput = ""
          if (pos != this.data.inputString.length - 1) {
            ++pos;
            ninput = this.data.inputString.swap(pos - 1, pos);
          } else {
            ninput = this.data.inputString.swap(pos, pos + 1);
          }
          this.setData({
            inputString: ninput,
            cursor: pos,
            SolveResult: ""
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
