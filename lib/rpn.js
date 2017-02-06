var FUNNUM = 15;
var FUN_INDEX_RANGE = -128 + FUNNUM;

var _operator = [];  //save operator
var _operands = [];  //save operands

function operater(c) {
    return ('+' == c || '-' == c || '*' == c || '/' == c ||
        '(' == c || ')' == c || '^' == c || '!' == c ||
        '%' == c || '=' == c);
}
function digit(c) {
    return ('0' <= c && c <= '9');
}
function isVariable(sign) {
    return (sign == 't' || sign == 'x' || sign == 'y' || sign == 'X' || sign == 'Y');
}
function isspace(c)
{
    return (" " == c || "\t" == c);
}
function cmpPRI(cursign) {
    //must >  not >=
    return (getPRI(cursign) > getPRI(_operator.top())) ? true : false;
    //return _btPri[PRI(_operator->top())][PRI(cursign)];
}

function getPRI(cursign) {
    if (cursign >= -128 && cursign <= FUN_INDEX_RANGE) {
        return 4;
    }
    switch (cursign) {
        case '#': case '(':
            return -1;
        case '+': case '-':
            return 0;
        case '*': case '/':
            return 1;
        case '_': //负数
            return 2;
        case '^': case '!':
            return 3;
        case ')':
            return 5;
        //case -128 ... FUN_INDEX_RANGE://function index
        case '$': //函数的参数结束标志
            return 4;
        default:
            return -1;
    }
}

var _sysfunS = [
    "factorial",/*阶乘*/    "acos",   /*反余弦*/    "asin",   /*反正弦*/      "atan",   /*反正切*/
    "ceil",   /*上取整*/    "cos",    /*余弦*/      "cosh",   /*双曲余弦*/    "exp",    /*指数值*/
    "abs",   /*绝对值*/     "floor",  /*下取整*/    "ln"  ,   /*自然对数*/     "log",    /*对数*/
    "sin",    /*正弦*/      "sqrt",   /*开方*/      "tan",    /*正切*/        //"user1",  /*自定义函数1*/    "user2"   /*自定义函数2*/
];

function isFun(sign) {
    return (sign < FUN_INDEX_RANGE);
}//_sysFun's number - 1 - 128

function getFun(funname) {
    var index = -1;
    while (++index < FUNNUM && funname != _sysfunS[index]);
    //    std::cout << _sysfunS[index] << std::endl;
    return (index - 128);
}

function rpn(expression) {
    //add top function
    Array.prototype.top = function () {
      var that = this || []; //important
      return that[that.length - 1];
    };

    expression += "#";
    console.log("rpn expression: " + expression);
    var _curpos = 0;
    function next() { return (expression[_curpos++]); }
    function prev() { return (expression[--_curpos]); }
    if (!expression) {
        return false;
    }
    var cur = '\0';
    var prevsym = '\0';
    var snumber = "";
    var funname = "";
    var funindex = '\0';
    var prevpos = -1;
    var havefun = 0;
    var left_bracket = 0;
    while ((cur = next()) != "#") {
        if (isspace(cur)) continue;
        if (digit(cur)) {
            snumber += cur;
            while (!operater(cur = next()) && cur != '#') { snumber += cur; }
            _operands.push([true,parseFloat(snumber)]);
            snumber = "";
            prev();
            continue;
        }
        switch (cur) {
            /*
            case '0' ... '9':
                snumber += cur;
                while(!operater(cur = next()) && cur != '#'){snumber += cur;}
                _operands.push(atof(snumber.c_str()));
                snumber = "";
                prev();
                break;
            */
            case '-':
                //从右往左遍历，遇到"-"时再判断它的前一个符，如果是数字或者右括号，那么它就是减号！
                prevsym = expression[_curpos - 2];
                if (!digit(prevsym) && prevsym != ')') {
                    //onsole.log + "_operands: " +  *_operands + );
                    _operator.push('_');
                    break;
                }
            /*
            if(operater(_operands.top()) ||
                    isFun(_operands.top())    ||
                    _operands.empty())//处理负号(-)
            {
                //onsole.log + "_operands: " +  *_operands + );
                _operator.push('_');
                break;
            }
            */
            case '+':
            case '*': case '/':
            case '^': case '!':
                if (cmpPRI(cur))// PRI(cur) > PRI(topsign)
                {
                    _operator.push(cur);
                }
                else {
                    while (!cmpPRI(cur)) {
                        _operands.push([false,_operator.pop()]);
                    }
                    _operator.push(cur);
                }
                break;
            case '(':
                _operator.push(cur);
                left_bracket++;
                break;
            case ')':
                while (_operator.top() != '(') {
                    _operands.push([false,_operator.pop()]);
                }
                _operator.pop();//丢弃')'对应的首个'('
                if (left_bracket == havefun && havefun--) {
                    _operator.push('$');//Function parameter ending flag
                }
                left_bracket--;
                break;
            case 'x': case 'X': case 'y': case 'Y':
                _operands.push([false,cur]);
                break;
            default:
                funname += cur;
                prevpos = _curpos;
                while (!operater(cur = next()) && cur != '#') { funname += cur; }
                funindex = getFun(funname.toLowerCase());
                if (isFun(funindex)) {
                    havefun++;
                    _operands.push([false,funindex]);
                    console.log(prevpos + " appear a function: " + funname);
                    funname = "";
                } else {
                    console.log(prevpos + " invalid function string: " + funname);
                    return false;
                }
                prev();
                break;
        }
    }
    while (_operator.length > 0) {
        _operands.push([false,_operator.pop()]);
    }
    console.log(_operands);
}

module.exports = {
    rpndata: _operands,
    isFun:isFun,
    isVariable:isVariable,
    rpn: rpn
}
