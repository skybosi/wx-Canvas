var app = getApp();
var util = require("../../utils/util.js");
var Data = require("../../data/data.js");
var Calcer = require("../../lib/expression.js");
var gridSwitch = false;
var input = "";
var curinput = ""

function lastInput(ctx) {
  if ("" != curinput) {
    ctx.setData({
      inputString: ctx.data.inputString + curinput,
      bindSource: []
    })
    curinput = "";
  }
}

function simlength(first, second) {
    var len = (first.length < second.length) ? (first.length) : (second.length);
	var i = 0;
    for(;i < len; ++i){
        if(first[i] != second[i]){
            break;
        }   
    }   
    return i; 
}

Page({
  data: {
    inputString: "",
    resultStatus: "none",
    adapterSource: ["factorial", "acos", "asin", "atan", "ceil", "cos", "cosh", "exp", "abs", "floor", "ln", "log", "sin", "sqrt", "tan",  //"user1",  /*自定义函数1*/ "user2"   /*自定义函数2*/
    ],//本地匹配源
    bindSource: []//绑定到页面的数据，根据用户输入动态变化
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg);
  },
  onLoad: function (e) {
    console.log("calcer is onload...")
  },
  onReady: function (e) {
    console.log("calcer is ready...")
  },
  onSolve: function (e) {
    lastInput(this);
    input = this.data.inputString;
    if (input.length == 0) {
      this.setData({
        resultStatus: "none",
        inputString: ""
      });
      context.clearRect(0, 0, canvasW, canvasH);
      context.draw();
      return;
    }
    var result = Calcer.calc(input);
    this.setData({
      resultStatus: "flex",
      SolveResult: result
    });
  },
  bindinput: function (e) {
    var prefix = e.detail.value = util.trim(e.detail.value.toLowerCase());
    var reg= new RegExp('(.{'+(e.detail.cursor-1)+'})');
    curinput = e.detail.value[e.detail.cursor-1];
    var len = this.data.inputString.length;
    if (len <= prefix.length)
    {
      prefix = prefix.substring(len);
      var newSource = []//匹配的结果
      if (prefix != "") {
        this.data.adapterSource.forEach(function (e) {
          if (e.indexOf(prefix) != -1) {
            newSource.push(e)
          }
        })
      }
      if (newSource.length != 0) {
        this.setData({
          bindSource: newSource
        })
      } else {
        if( this.data.bindSource.length == 0){
          this.setData({
            inputString: this.data.inputString.replace(reg,'$1' + curinput),
            bindSource: []
          })
          curinput = "";
        }else{
          this.setData({
            inputString: this.data.inputString + prefix,
            bindSource: []
          })
        }
      }
    }else{
      var tmp = this.data.inputString.replace(reg,'$1' + curinput)
      this.setData({
        inputString: prefix,
        bindSource: [],
        SolveResult: prefix
      })
      curinput = "";
    }
  },
  itemtap: function (e) {
    this.setData({
      inputString: this.data.inputString + e.target.id,
      bindSource: []
    });
    console.log("itemtap detail " + e.target.id);
  },
  onPlot: function () {
    lastInput(this);
    input = this.data.inputString;
    wx.navigateTo({
      //url: '../logs/logs?input='+input
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
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      desc: '自定义分享描述',
      path: '/page/user?id=123'
    }
  },
});
