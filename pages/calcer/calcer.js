//index.js
import Page from '../../components/page/page';

var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../doc/data/data.js");
var Calcer = require("../../libs/expression.js");
var Font_Size = 20;
var input = "";
var placeholder = '';
var currpos = [0, 0]
var prevpos = [0, 0]
var pixelRatio = null
function getPosition(e) {
  //console.log(e.touches[0].x,e.touches[0].y);
  //return [e.touches[0].x, e.touches[0].y];
  return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
}

Page({
  data: {
    inputHead: '',
    inputTail: '',
    resultStatus: "none",
    SolveResult: "",
    cursor: 0,
    cursorpx: 8,
    keyboards: [
      {
        head: [
          { "t": "←", "T": "ctrl" }, { "t": "→", "T": "ctrl" },
          { "t": "↵", "T": "ctrl" }, { "t": "Plot", "T": "ctrl" },
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
          { "t": "←", "T": "ctrl" }, { "t": "→", "T": "ctrl" },
          { "t": "↵", "T": "ctrl" }, { "t": "Plot", "T": "ctrl" },
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
          { "t": "←", "T": "ctrl" }, { "t": "→", "T": "ctrl" },
          { "t": "↵", "T": "ctrl" }, { "t": "Plot", "T": "ctrl" },
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
    keyboardShow: true,
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function (e) {
    var self = this
    var query = wx.createSelectorQuery()
    query.select('#swiper-item').boundingClientRect(function (res) {
      console.log(res);
      self.setData({
        keyboardHeight: res.height
      });
    }).exec();
    wx.getSystemInfo({
      success: function (res) {
        pixelRatio = res.pixelRatio;
        var W = res.windowWidth;
        var H = res.windowHeight;
      }
    })
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
    let data = this.data
    data.cursorpx = 8 / pixelRatio
    data.resultStatus = "none"
    this.setData(data);
    wx.clearStorage();
  },
  onSolve: function (e) {
    input = this.data.inputString;
    var result = Calcer.calc(input);
    this.setData({
      resultStatus: "flex",
      SolveResult: result
    });
  },
  onPlot: function () {
    input = this.data.inputString;
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
    let dataset = e.currentTarget.dataset || e.target.dataset || {};
    let text = dataset.text
    let dataChange = false
    let pos = this.data.cursor;
    let cursor = this.data.cursor
    let inputHead = this.data.inputHead
    let inputTail = this.data.inputTail
    switch (text) {
      case "Plot":
        this.onPlot();
        break;
      case "Solve": case "↵":
        this.onSolve();
        break;
      case "Del":
        if (pos - 1 >= 0) {
          dataChange = true
          cursor = --this.data.cursor
          inputTail = this.data.inputTail
          inputHead = this.data.inputHead.substr(0, pos - 1)
        }
        break;
      case "←":
        if (pos - 1 >= 0) {
          dataChange = true
          cursor = --this.data.cursor
          inputTail = this.data.inputHead.substr(pos - 1, pos) + this.data.inputTail
          inputHead = this.data.inputHead.substr(0, pos - 1)
        }
        break;
      case "→":
        if (pos + 1 <= this.data.inputString.length) {
          dataChange = true
          cursor = ++this.data.cursor
          inputHead = this.data.inputHead + this.data.inputTail.substr(0, 1)
          inputTail = this.data.inputTail.substr(1)
        }
        break;
      case "()": case "[]": case "{}":
        dataChange = true
        inputHead = this.data.inputHead + text.substr(0, 1)
        inputTail = text.substr(1) + this.data.inputTail
        cursor = this.data.cursor + text.length - 1
        break;
      default:
        dataChange = true
        inputHead = this.data.inputHead + text
        inputTail = this.data.inputTail
        cursor = this.data.cursor + text.length
        break;
    }
    if (dataChange) {
      this.setData({
        cursor: cursor,
        inputHead: inputHead,
        inputTail: inputTail,
        inputString: inputHead + inputTail
      });
    }
  },
  longbclick: function (e) {
    let dataset = e.currentTarget.dataset || e.target.dataset || {};
    let text = dataset.text
    switch (text) {
      case "Del":
        this.setData({
          cursor: 0,
          inputHead: "",
          inputTail: "",
          inputString: "",
          cursorpx: 8 / pixelRatio,
          SolveResult: "",
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
        e.currentTarget.dataset = e.currentTarget.dataset || {};
        e.target.dataset = e.target.dataset || {};
        e.currentTarget.dataset.text = '→';
        e.target.dataset.text = '→';
        this.bclick(e);
      } else {
        e.currentTarget.dataset = e.currentTarget.dataset || {};
        e.target.dataset = e.target.dataset || {};
        e.currentTarget.dataset.text = '←';
        e.target.dataset.text = '←';
        this.bclick(e);
      }
    }
  },
  longTap: function (e) {
    app.globalData.clipboard = this.data.inputString
    // console.log(e.timeStamp + '- long tap');
  },
  bindTap: function (e) {
    var pos = getPosition(e)
    if (pos[0] > this.data.cursorpx) {
      this.setData({
        inputString: this.data.inputString,
        cursor: this.data.inputString.length - 1,
      });
    } else {
      var ncursor = this.data.inputString.length - 1 + Math.ceil((pos[0] - this.data.cursorpx) / 10);
      var ninput = this.data.inputString
      if (ncursor >= ninput.length) {
        ninput += placeholder;
      } else {
        ninput = ninput.insert(placeholder, ncursor);
      }
      this.setData({
        inputString: ninput,
        cursor: ncursor,
      });
    }
  },

  //键盘显示/隐藏
  switchKeyboard(e) {
    let curTime = e.timeStamp;
    let lastTime = this.lastTapDiffTime;
    this.lastTapDiffTime = curTime;
    let diff = curTime - lastTime;
    //两次点击间隔小于250ms, 认为是双击
    if (diff < 250) {
      this.setData({
        keyboardShow: !this.data.keyboardShow
      });
    } else {
      // 单击事件延时300毫秒执行，这和最初的浏览器的点击250ms延时有点像。
    }
  },
});
