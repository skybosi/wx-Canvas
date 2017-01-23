#include <ctype.h>
#include <cmath>
#include "iRpn.h"

namespace Imaginer{
namespace Utils {

iRpn::iRpn():_expnames(NULL),_curpos(0)
{
    _operator = new iStack<char>;
    _operator->push('#');
    _operands = new iStack<RPNnode>;
}

iRpn::iRpn(char* expname):_expnames(expname),_curpos(0)
{
    _operator = new iStack<char>;
    _operator->push('#');
    _operands = new iStack<RPNnode>;
}

iRpn::~iRpn()
{
    //(_operator) ? (delete _operator,_operator = NULL) : (_operator);
    if(_operator)
    {
        delete _operator;
        _operator = NULL;
    }
    //(_operands) ? (delete _operands,_operands = NULL) : (_operands);
    if(_operands)
    {
        delete _operands;
        _operands = NULL;
    }
}

std::string   iRpn::_sysfunS[] =
{
    "self",   /*self(x)=x*/ "zero",   /*zero(x)=0*/ "one",     /*one(x)=1*/  "factorial",/*阶乘*/
    "acos",   /*反余弦*/    "asin",   /*反正弦*/      "atan",   /*反正切*/      "ceil",   /*上取整*/
    "cos",    /*余弦*/      "cosh",   /*双曲余弦*/    "exp",    /*指数值*/      "fabs",   /*绝对值*/
    "floor",  /*下取整*/    "log",    /*对数*/        "log10",  /*对数*/        "sin",    /*正弦*/
    "sqrt",   /*开方*/      "tan",    /*正切*/        "user1",  /*自定义函数1*/  "user2"   /*自定义函数2*/
};

bool iRpn::_btPri[][8] =  //big pri
{
        /*[>]   [#] [+] [-] [*] [/] [^] [(] [)]*/
        /*[#]*/{ 0,  1,  1,  1,  1,  1,  1,  1 },
        /*[+]*/{ 0,  0,  0,  1,  1,  1,  0,  1 },
        /*[-]*/{ 0,  0,  0,  1,  1,  1,  0,  1 },
        /*[*]*/{ 0,  0,  0,  0,  0,  1,  0,  1 },
        /*[/]*/{ 0,  0,  0,  0,  0,  1,  0,  1 },
        /*[^]*/{ 0,  0,  0,  0,  0,  1,  0,  1 },
        /*[(]*/{ 0,  1,  1,  1,  1,  1,  0,  1 },
        /*[)]*/{ 0,  0,  0,  0,  0,  0,  0,  0 },
};

bool iRpn::_bePri[][8] = //big-equl pri
{
        /*[>=]  [#] [+] [-] [*] [/] [^] [(] [)]*/
        /*[#]*/{ 1,  1,  1,  1,  1,  1,  1,  1 },
        /*[+]*/{ 0,  1,  1,  1,  1,  1,  0,  1 },
        /*[-]*/{ 0,  1,  1,  1,  1,  1,  0,  1 },
        /*[*]*/{ 0,  0,  0,  1,  1,  1,  0,  1 },
        /*[/]*/{ 0,  0,  0,  1,  1,  1,  0,  1 },
        /*[^]*/{ 0,  0,  0,  1,  1,  1,  0,  1 },
        /*[(]*/{ 0,  1,  1,  1,  1,  1,  1,  1 },
        /*[)]*/{ 0,  0,  0,  0,  0,  0,  0,  0 },
};

int  iRpn::PRI(char sign)
{
    switch (sign){
    case '#':  return 0;
    case '+':  return 1;
    case '-':  return 2;
    case '*':  return 3;
    case '/':  return 4;
    case '^':  return 5;
    case ')':  return 6;
    case '(':  return 7;
    default :  break;
    }
    return -1;
}

void iRpn::upPRI(char& cursign,double& value)
{
    switch (cursign) {
    case '+':
        cursign = '*';
        value = 2;
        break;
    case '-':
        cursign = '+';//no use
        value = 0;
        break;
    case '*':
        cursign = '^';
        value = 2;
        break;
    case '/':
        cursign = '+';//no use
        value = 1;
    default:
        break;
    }
}

bool iRpn::cmpPRI(char cursign)
{
    //must >  not >=
    return (getPRI(cursign) > getPRI(_operator->top())) ? true :false;
    //return _btPri[PRI(_operator->top())][PRI(cursign)];
}

int  iRpn::getPRI(char cursign)
{
    if( cursign >= -128 && cursign <= FUN_INDEX_RANGE)
    {
        return 4;
    }
    switch (cursign) {
    case '#':case '(':
        return -1;
    case '+':case '-':
        return 0;
    case '*':case '/':
        return 1;
    case '^':case '!':
        return 2;
    case ')':
        return 3;
    //case -128 ... FUN_INDEX_RANGE://function index
    case '$': //函数的参数结束标志
    case '_': //负数
        return 4;
    default:
        return -1;
    }
}

bool iRpn::genRpn()
{
    if(!_expnames)
    {
        std::cout << "expression is empty" << std::endl;
        std::cout << "You can use setExp set a function expression!" << std::endl;
        return false;
    }
    char cur = '\0';
    char prevsym = '\0';
    std::string snumber;
    std::string funname;
    char funindex = '\0';
    int  prevpos = -1;
    int  havefun = 0;
    int left_bracket = 0;
    while((cur = next()))
    {
        if(isspace(cur))continue;
        if(digit(cur))
        {
            snumber += cur;
            while(!operater(cur = next()) && cur != '\0'){snumber += cur;}
            _operands->push(atof(snumber.c_str()));
            snumber = "";
            prev();
            continue;
        }
        switch (cur)
        {
        /*
        case '0' ... '9':
            snumber += cur;
            while(!operater(cur = next()) && cur != '\0'){snumber += cur;}
            _operands->push(atof(snumber.c_str()));
            snumber = "";
            prev();
            break;
        */
        case '-':
            //从右往左遍历，遇到"-"时再判断它的前一个符，如果是数字或者右括号，那么它就是减号！
            prevsym = _expnames[_curpos-2];
            if(!digit(prevsym) && prevsym != ')')
            {
                //std::cout << "_operands: " <<  *_operands << std::endl;
                _operator->push('_');
                break;
            }
            /*
            if(operater(_operands->top()) ||
                    isFun(_operands->top())    ||
                    _operands->empty())//处理负号(-)
            {
                //std::cout << "_operands: " <<  *_operands << std::endl;
                _operator->push('_');
                break;
            }
            */
        case '+':
        case '*':case '/':
        case '^':case '!':
            if(cmpPRI(cur))// PRI(cur) > PRI(topsign)
            {
                _operator->push(cur);
            }
            else
            {
                while(!cmpPRI(cur))
                {
                    _operands->push(_operator->pop());
                }
                _operator->push(cur);
            }
            break;
        case '(':
            _operator->push(cur);
            left_bracket++;
            break;
        case ')':
            while(_operator->top() != '(')
            {
                _operands->push(_operator->pop());
            }
            _operator->pop();//丢弃')'对应的首个'('
            if(left_bracket == havefun && havefun--)
            {
                _operator->push('$');//Function parameter ending flag
            }
            left_bracket--;
            break;
        case 'x':case 'X': case 'y':case 'Y':
            _operands->push(cur);
            break;
        default:
            funname += cur;
            prevpos = _curpos;
            while(!operater(cur = next())){funname += cur;}
            funindex = getFun(funname);
            if(isFun(funindex))
            {
                havefun++;
                _operands->push(funindex);
                std::cout << prevpos << " appear a function: " << funname << std::endl;
                funname = "";
            }else
            {
                std::cout << prevpos << " invalid function string: " << funname << std::endl;
                return false;
            }
            prev();
            break;
        }
    }
    while(_operator->size() > 0)
    {
        _operands->push(_operator->pop());
    }
    std::cout << *_operands << std::endl;
    //std::cout << (_operands->reverse()) << std::endl;
    return true;
}

void iRpn::Parser()
{
    //genRpn();
    //_operands->reverse();
    iStack<RPNnode> result;
    int size = _operands->size();
    RPNnode curnode;
    char op = '\0';
    RPNnode  loperand;
    RPNnode  roperand;
    for(int i = 0;i <= size;++i)
    {
        curnode = (*_operands)[i];
        //std::cout << curnode << "\n";
        if(!curnode)//opearator
        {
            if(isVariable(curnode))
            {
                result.push(curnode);
                std::cout << "unknowns nunber " << curnode << std::endl;
            }
            else
            {
                op = curnode;
                if(op < 0)
                {
                    if(isFun(op))
                        std::cout << "Function: " << _sysfunS[op+128] << std::endl;
                    else
                    {
                        std::cout << "no sunch Function: " << std::endl;
                        break;
                    }
                }
                if(result.empty() || result.size() < 1)
                {
                    continue;
                }
                loperand = result[-1];
                roperand = result[-2];
                if(!loperand)
                {
                    std::cout << "L cannot calculate" << std::endl;
                    continue;
                }
                if(!roperand)
                {
                    std::cout << "R cannot calculate" << std::endl;
                    continue;
                }
                switch (op)
                {
                case '_':
                    result.push(roperand);
                    result.push(-loperand);
                    break;
                case '+':
                    result.push(roperand+loperand);
                    break;
                case '-':
                    result.push(roperand-loperand);
                    break;
                case '*':
                    result.push(roperand*loperand);
                    break;
                case '/':
                    result.push(roperand/loperand);
                    break;
                case '^':
                    result.push(pow(roperand,loperand));
                    break;
                default:
                    std::cout << "invalid operator" << std::endl;
                    break;
                }
            }
        }
        else//operand
        {
            result.push(curnode);
            //std::cout << curnode << "\n";
        }
    }
    std::cout << result << std::endl;
}

char   iRpn::getFun(std::string funname)
{
    char index = -1;
    while(++index < FUNNUM && funname != _sysfunS[index]);
    //    std::cout << _sysfunS[index] << std::endl;
    return (index - 128);
}

}//namespace Utils
}//namespace Imaginer
