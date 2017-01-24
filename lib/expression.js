var RPNer = require("./rpn.js");

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
                case 'x':case 'X':
                    result.push(x);
                    break;
                case 'y':case 'Y':
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

function parser(expression,x,y)
{
    console.log("parser expression: " + expression);
    rpndata.length = 0;
    curpos = 0;
    if(RPNer.rpn(expression) == false)
    {
        return "Syntax Error";
    }
    rpndata = RPNer.rpndata;
    console.log("parser rpn data: " + rpndata + " length: " + rpndata.length);
    //add top function
    Array.prototype.top = function () {
      var that = this || []; //important
      return that[that.length - 1];
    };
    console.log(rpndata.top());
    var result = [];
    Parser(result,curpos,x,y);
    //std::cout << "result: " << result << std::endl;
    return result.top();
}
module.exports = {
  parser: parser
}