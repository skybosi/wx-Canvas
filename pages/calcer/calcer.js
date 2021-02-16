//index.js
import Page from '../../components/page/page';

var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../libs/expression.js");
var Font_Size = 20;
var input = "";
var placeholder = '|';
var currpos = [0, 0]
var prevpos = [0, 0]
var Page_Switch_Sensitivity = 50
var iReg = null
var pixelRatio = null
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
    cursorpx: 8,
    commonIds: ["Enter", "Plot", "Solve", "Del"],
    keyboardHeight: app.globalData.DiviceInfo.screenHeight * 0.6,
    keyboards: [
      {
        head: [
          { "t": "Enter", "T": "ctrl" }, { "t": "Plot", "T": "ctrl" },
          { "t": "Solve", "T": "ctrl" }, { "t": "Del", "T": "ctrl" }
        ],
        body: [
          [
            { "t": "asin", "T": "func" }, { "t": "π", "T": "func" },
            { "t": "abs", "T": "num" }, { "t": "exp", "T": "num" },
            { "t": "3", "T": "num" }, { "t": "/", "T": "sign" },
            { "t": "()", "T": "sign" }
          ],
          [
            { "t": "acos", "T": "func" }, { "t": "e", "T": "func" },
            { "t": "ceil", "T": "num" }, { "t": "floor", "T": "num" },
            { "t": "6", "T": "num" }, { "t": "*", "T": "sign" },
            { "t": "^", "T": "sign" }
          ],
          [
            { "t": "atan", "T": "func" }, { "t": "Φ", "T": "func" },
            { "t": "7", "T": "num" }, { "t": "8", "T": "num" },
            { "t": "9", "T": "num" }, { "t": "-", "T": "sign" },
            { "t": "√", "T": "sign" }
          ],
          [
            { "t": "log", "T": "func" }, { "t": "γ", "T": "func" },
            { "t": ",", "T": "num" }, { "t": "0", "T": "num" },
            { "t": ".", "T": "num" }, { "t": "+", "T": "sign" },
            { "t": "[]", "T": "sign" }
          ],
        ]
      },
      {
        head: [
          { "t": "Enter", "T": "ctrl" }, { "t": "Plot", "T": "ctrl" },
          { "t": "Solve", "T": "ctrl" }, { "t": "Del", "T": "ctrl" }
        ],
        body: [
          [
            { "t": "sin", "T": "func" }, { "t": "x", "T": "func" },
            { "t": "7", "T": "num" }, { "t": "8", "T": "num" },
            { "t": "9", "T": "num" }, { "t": "/", "T": "sign" },
            { "t": "()", "T": "sign" }
          ],
          [
            { "t": "cos", "T": "func" }, { "t": "y", "T": "func" },
            { "t": "4", "T": "num" }, { "t": "5", "T": "num" },
            { "t": "6", "T": "num" }, { "t": "*", "T": "sign" },
            { "t": "^", "T": "sign" }
          ],
          [
            { "t": "tan", "T": "func" }, { "t": "T", "T": "func" },
            { "t": "1", "T": "num" }, { "t": "2", "T": "num" },
            { "t": "3", "T": "num" }, { "t": "-", "T": "sign" },
            { "t": "√", "T": "sign" }
          ],
          [
            { "t": "ln", "T": "func" }, { "t": "=", "T": "func" },
            { "t": ",", "T": "num" }, { "t": "0", "T": "num" },
            { "t": ".", "T": "num" }, { "t": "+", "T": "sign" },
            { "t": "[]", "T": "sign" }
          ],
        ]
      },
      {
        head: [
          { "t": "Enter", "T": "ctrl" }, { "t": "Plot", "T": "ctrl" },
          { "t": "Solve", "T": "ctrl" }, { "t": "Del", "T": "ctrl" }
        ],
        body: [
          [
            { "t": "asin", "T": "func" }, { "t": "π", "T": "func" },
            { "t": "abs", "T": "num" }, { "t": "exp", "T": "num" },
            { "t": "。", "T": "num" }, { "t": "D", "T": "sign" }
          ],
          [
            { "t": "acos", "T": "func" }, { "t": "i", "T": "func" },
            { "t": "re", "T": "num" }, { "t": "im", "T": "num" },
            { "t": "!", "T": "num" }, { "t": "∫", "T": "sign" }
          ],
          [
            { "t": "atan", "T": "func" }, { "t": "e", "T": "func" },
            { "t": "floor", "T": "num" }, { "t": "ceil", "T": "num" },
            { "t": "E", "T": "num" }, { "t": "Limit", "T": "sign" }
          ],
          [
            { "t": "log", "T": "func" }, { "t": "γ", "T": "func" },
            { "t": ",", "T": "num" }, { "t": "∞", "T": "num" },
            { "t": ".", "T": "num" }, { "t": "ans", "T": "sign" },
          ],
        ]
      },
    ],
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function (e) {
    iReg = new RegExp('(.{0})');
    this.data.kyboardIds = this.data.commonIds.concat(this.data.kyboardIds);
    this.data.basekeyIds = this.data.commonIds.concat(this.data.basekeyIds);
    wx.getSystemInfo({
      success: function (res) {
        pixelRatio = res.pixelRatio;
        var W = res.windowWidth;
        var H = res.windowHeight;
      }
    })
    var tmp = "acd".insert("b123", 1);
  },
  onReady: function (e) {
    // console.log("calcer is ready...")
    var self = this;
  },
  onShow: function () {
    // console.log("calcer is onShow...")
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
    // console.log("calcer is onHide...")
  },
  onUnload: function () {
    // 页面关闭
    this.setData({
      inputString: placeholder,
      resultStatus: "none",
      cursorpx: 8 / pixelRatio,
      cursor: 0
    });
    wx.clearStorage();
    // console.log("calcer is onUnload...")
  },
  onSolve: function (e) {
    input = this.data.inputString.replace(placeholder, '');
    if (input.length == 0) {
      this.setData({
        resultStatus: "none",
        inputString: placeholder
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
    if ("" == input || "null" == result.toLowerCase() || "undefined" == result.toLowerCase() || "Syntax Error" == result) {
      return;
    }
    wx.navigateTo({
      url: '../drawer/drawer?input=' + input,
      success: function (res) {
        // success
        // console.log('onBtnClick success() res:');
      },
      fail: function (e) {
        // fail
        console.error('onBtnClick fail() !!!');
      },
      complete: function (e) {
        // console.log('onBtnClick complete() !!!');
        // complete
      }
    })
  },
  bclick: function (e) {
    // console.log(e.target.id);
    var dataset = e.currentTarget.dataset || e.target.dataset || {};
    var id = dataset.text
    var index = this.data.basekeyIds.indexof(id)
    var input = null;
    iReg = new RegExp('(.{' + (this.data.cursor) + '})');
    if (null != iReg) {
      input = this.data.inputString.replace(iReg, '$1' + id);
      iReg = null;
    } else {
      input = this.data.inputString + id;
    }
    if (index > 3) {
      if (id != "y" && id != "=") {
        this.setData({
          inputString: input,
          cursor: this.data.cursor + id.length,
          cursorpx: (this.data.inputString.length * Font_Size + 8) / pixelRatio
        });
      }

      switch (id) {
        case "Del":
          var pos = this.data.cursor - 1;
          if (pos >= 0) {
            this.setData({
              inputString: this.data.inputString.del(pos),
              cursor: --this.data.cursor,
              cursorpx: (this.data.inputString.length * Font_Size + 8) / pixelRatio,
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
  lbclick: function (e) {
    var id = e.target.id;
    switch (id) {
      case "Del":
        this.setData({
          inputString: placeholder,
          cursorpx: 8 / pixelRatio,
          SolveResult: "",
          cursor: 0
        });
        break;
      default:
        break;
    }
  },
  touchStart: function (e) {
    prevpos = getPosition(e)
    // console.log("Touch Start... " + prevpos[0], prevpos[1]);
  },
  touchMove: function (e) {
    var pos = getPosition(e)
    // console.log("Touch Move... " + pos[0], pos[1], this.data.inputHeight);
  },
  touchEnd: function (e) {
    currpos = getPosition(e)
    // console.log("Touch End... " + currpos[0], currpos[1]);
    var distance = currpos[0] - prevpos[0];
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        e.target.id = '→';
        this.bclick(e);
      } else {
        e.target.id = '←';
        this.bclick(e);
      }
    }
  },
  longTap: function (e) {
    app.globalData.clipboard = this.data.inputString.replace(placeholder, '');
    // console.log(e.timeStamp + '- long tap');
  },
  bindTap: function (e) {
    var pos = getPosition(e)
    if (pos[0] > this.data.cursorpx) {
      this.setData({
        inputString: this.data.inputString.replace(placeholder, '') + placeholder,
        cursor: this.data.inputString.length - 1,
      });
    } else {
      var ncursor = this.data.inputString.length - 1 + Math.ceil((pos[0] - this.data.cursorpx) / 10);
      var ninput = this.data.inputString.replace(placeholder, '');
      if (ncursor >= ninput.length) {
        ninput += placeholder;
      } else {
        ninput = ninput.insert(placeholder, ncursor);
      }
      // console.log(e.timeStamp + '- tap' + ninput + " ncursor:" + ncursor);
      this.setData({
        inputString: ninput,
        cursor: ncursor,
      });
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
