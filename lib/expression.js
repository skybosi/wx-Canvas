var RPNer = require("./rpn.js");

//add top function
Array.prototype.top = function () {
  var that = this || []; //important
  return that[that.length - 1];
};

var deepcopy = function (o) {
    if (o instanceof Array) {
        var n = [];
        for (var i = 0; i < o.length; ++i) {
            n[i] = deepcopy(o[i]);
        }
        return n;

    } else if (o instanceof Object) {
        var n = {}
        for (var i in o) {
            n[i] = deepcopy(o[i]);
        }
        return n;
    } else {
        return o;
    }
}
/*
function deepcopy(obj) {
    var out = [], i = 0, len = obj.length;
    for (; i < len; i++) {
        if (obj[i] instanceof Array) {
            out[i] = deepcopy(obj[i]);
        }
        else out[i] = obj[i];
    }
    return out;
}
*/
function factorial(x) {
    var result = 1.0;
    for (var i = 1; i <= x; ++i) {
        result = result * i;
    }
    return result;
}
//note: This is log10()
function log(x) {
    return Math.log(x) / Math.log(10);
}

var _sysfun =
[
    factorial,/*阶乘*/         Math.acos,   /*反余弦*/    Math.asin,   /*反正弦*/      Math.atan,   /*反正切*/      
    Math.ceil,   /*上取整*/    Math.cos,    /*余弦*/      Math.cosh,   /*双曲余弦*/    Math.exp,    /*指数值*/
    Math.abs,   /*绝对值*/     Math.floor,  /*下取整*/    Math.log,    /*自然对数*/    log,    /*对数*/
    Math.sin,    /*正弦*/      Math.sqrt,   /*开方*/      Math.tan,    /*正切*/      //user1,  /*自定义函数1*/  user2   /*自定义函数2*/
];

var _sysfunS = [
    "factorial",/*阶乘*/    "acos",   /*反余弦*/    "asin",   /*反正弦*/      "atan",   /*反正切*/
    "ceil",   /*上取整*/    "cos",    /*余弦*/      "cosh",   /*双曲余弦*/    "exp",    /*指数值*/
    "abs",   /*绝对值*/     "floor",  /*下取整*/    "ln"  ,   /*自然对数*/     "log",    /*对数*/
    "sin",    /*正弦*/      "sqrt",   /*开方*/      "tan",    /*正切*/       //"user1",  /*自定义函数1*/ "user2"   /*自定义函数2*/
];

var rpndata = [];
var curpos = 0;
var beforeFun = 0;
var lastInput = "";
var unlastInput = "";
var lastResult;
var unlastResult = [];
var oldxrange = [];
var oldyrange = [];

function Parser(result, start, x, y) {
    var size = rpndata.length;
    if(start > size)
        return 0;
    var  curnode = "";
    var  op = "";
    var  loperand;
    var  roperand;
    var  r  = 0;
    var i = start;
    for (; curnode[1] != '$' && i < size; start = ++i) {
        curnode = rpndata[i];
        if(curnode[0] == false)//opearator || unknowns number(x;y) || function index
        {
            op = curnode[1];
            if(RPNer.isFun(op))//case -128 ... FUN_INDEX_RANGE://function index
            {
                //std::cout << "Function: " << _sysfunS[op+128] << std::endl;
                beforeFun = i+1;
                Parser(result,++i,x,y);
                r = result.pop();
                result.push(_sysfun[op+128](r));
                i = --curpos;
            }else if(RPNer.isVariable(op))
            {
                switch (op)
                {
                case 'x':
                    result.push(x);
                    break;
                case 'y':
                    result.push(y);
                    break;
                default:
                    break;
                }
            }else
            {
                switch (op)
                {
                case '+':
                    roperand = result.pop();
                    loperand = result.pop();
                    result.push(loperand+roperand);
                    break;
                case '_':
                    result.push(-result.pop());
                    break;
                case '-':
                    roperand = result.pop();
                    loperand = result.pop();
                    result.push(loperand-roperand);
                    break;
                case '*':
                    roperand = result.pop();
                    loperand = result.pop();
                    result.push(loperand*roperand);
                    break;
                case '/':
                    roperand = result.pop();
                    loperand = result.pop();
                    result.push(loperand/roperand);
                    break;
                case '^':
                    roperand = result.pop();
                    loperand = result.pop();
                    result.push(Math.pow(loperand,roperand));
                    break;
                case '!':
                    result.push(factorial(result.pop()));
                    break;
                default:
                    //std::cout << "invalid operator: " << op << std::endl;
                    break;
                }
            }
        }
        else//operand
        {
            result.push(curnode[1]);
            //std::cout << curnode << "\n";
        }
    }
    curpos = start;
    return result.top();
}

function genRPN(expression) {
    console.log("parser expression: " + expression);
    //有未知数，逆波兰表达式只解析一次
    var unknowns = {x:-1,y:-1,z:-1};
    if (rpndata.length == 0 &&
        ((unknowns.x = (expression.indexOf("x") != -1)) ||
         (unknowns.y = (expression.indexOf("y") != -1)) ||
         (unknowns.t = (expression.indexOf("t") != -1)))) {
        if (RPNer.rpn(expression) == false) {
            return "Syntax Error";
        }
        rpndata = RPNer.rpndata;
        return ["Unknowns",unknowns];
    } else { //仅仅是一个计算器
        if (RPNer.rpn(expression) == false) {
            return "Syntax Error";
        }
    }
    rpndata = RPNer.rpndata;
    console.log("parser rpn data: " + rpndata + " length: " + rpndata.length);
    return "OK";
}

function parser(x, y) {
    var result = [];
    curpos = 0;
    Parser(result, curpos, x, y);
    //std::cout << "result: " << result << std::endl;
    return result.top();
}

function calcs(input, xrange, yrange) {
    var rt = unlastResult;
    if (input[0] == "(" && input[input.length - 1] == ")") {
        input = input.substring(1, input.length - 1);
    }
    if (xrange == undefined) { xrange = [-5, 5]; }
    if (yrange == undefined) { yrange = [-5, 5]; }
    oldxrange = xrange;
    oldyrange = yrange;
    if (input !== unlastInput || xrange !== oldxrange || yrange !== oldyrange) {
        rpndata.length = 0;
        rt.length = 0
        curpos = 0;
        unlastInput = input;
        if (input == "")
            return;
        result = genRPN(input);
        if (result == "Syntax Error") {    //ERROR
            return result;
        } else if (result[0] == "Unknowns") { //Unknowns
         // result.shift();
         // will return a array (x,y,z) to save points data, default range is x <- (-5,5) y <- (-5,5)
            var xmM = [xrange[0],xrange[1]],ymM = [0,0];
            var yyy = 0;
            var yy = yrange[0];
            var dealt = (xrange[1]-xrange[0])/100;
            do{
                for (var xx = xrange[0]; result[1].x != -1 && xx < xrange[1]; xx += dealt) {
                    yyy = parser(xx);
                    if (!isNaN(yyy)) {
                        if (yyy < ymM[0]) { ymM[0] = yyy; }
                        if (yyy > ymM[1]) { ymM[1] = yyy; }
                        if (yyy < 9999999 &&
                            yyy > -9999999)
                            rt.push([xx, yyy]);
                    } else {
                        rt.length = 0;
                    }
                }
                yy += dealt;
            } while (result[1].y != -1 && yy < yrange[1]);
        }
        rt.unshift(ymM);
        rt.unshift(xmM);
        unlastResult = rt;
    }
    console.log(input + " = " + rt);
    return deepcopy(rt);
}
function calc(input) {
    var result = lastResult;
    if (input != lastInput) {
        rpndata.length = 0;
        curpos = 0;
        lastInput = input;
        if (input == "")
            return;
        result = genRPN(input);
        if (result == "Syntax Error") {    //ERROR
            return result;
        } else if (result[0] == "Unknowns") { //Unknowns
            result = input;
        }else {                           //just a calculate
            result = parser();
        }
        lastResult = result;
    }
    console.log(input + " = " + result);
    return result;
}

module.exports = {
  calc:calc,
  calcs:calcs
}