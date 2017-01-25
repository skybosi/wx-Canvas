var RPNer = require("./rpn.js");

//add top function
Array.prototype.top = function () {
  var that = this || []; //important
  return that[that.length - 1];
};

function factorial(x)
{
    var result = 1.0;
    for (var i = 1; i <= x; ++i)
    {
        result = result * i;
    }
    return result;
}
//note: This is log10()
function log(x)
{
  return Math.log(x)/Math.log(10);
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
var lastResult;
function Parser(result,start,x,y)
{
    var size = rpndata.length;
    if(start > size)
        return 0;
    var  curnode = "";
    var  op = "";
    var  loperand;
    var  roperand;
    var  r  = 0;
    var i = start;
    for(;curnode[1] != '$' && i < size; start = ++i)
    {
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
    if (rpndata.length == 0 &&
        (expression.indexOf("x") != -1 ||
            expression.indexOf("y") != -1 ||
            expression.indexOf("t") != -1)) {
        if (RPNer.rpn(expression) == false) {
            return "Syntax Error";
        }
        return "Unknowns";
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
    Parser(result, curpos, x, y);
    //std::cout << "result: " << result << std::endl;
    return result.top();
}

function calcs(input, x, y, xrange, yrange) {
    if (x == undefined || y == undefined) {
        return input;
    } else { // will return a array (x,y,z) to save points data, default range is x <- (-5,5) y <- (-5,5)
        if(xrange == undefined){xrange = [-5,5];}
        if(yrange == undefined){yrange = [-5,5];}
        return parser(x, y);
    }
}

function calc(input, x, y) {
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
        } else if (result == "Unknowns") { //Unknowns
            result = calcs(input, x, y);
        } else {                           //just a calculate
            result = parser();
        }
    }
    console.log(input + " = " + result);
    lastResult = result;
    return result;
}

module.exports = {
  calc:calc
}