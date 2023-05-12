function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function write(v) { WScript.Echo(v + ""); }

function is_negative_zero(n)
{
    if(n == 0 && 1/n < 0)
        return true;
    else
        return false;
}

function itself(a) { return a; }

var x; var y;

// mul
x = 0*0;   write(" 0* 0 : " + x + " " + is_negative_zero(x));
x = -0*0;  write("-0* 0 : " + x + " " + is_negative_zero(x));
x = 0*-0;  write(" 0*-0 : " + x + " " + is_negative_zero(x));
x = -0*-0; write("-0*-0 : " + x + " " + is_negative_zero(x));

x = 5*5;   write(" 5* 5 : " + x + " " + is_negative_zero(x));
x = -5*5;  write("-5* 5 : " + x + " " + is_negative_zero(x));
x = 5*-5;  write(" 5*-5 : " + x + " " + is_negative_zero(x));
x = -5*-5; write("-5*-5 : " + x + " " + is_negative_zero(x));

x = 0*5;   write(" 0* 5 : " + x + " " + is_negative_zero(x));
x = -0*5;  write("-0* 5 : " + x + " " + is_negative_zero(x));
x = 0*-5;  write(" 0*-5 : " + x + " " + is_negative_zero(x));
x = -0*-5; write("-0*-5 : " + x + " " + is_negative_zero(x));

// Div
x = 0/0;   write(" 0/ 0 : " + x + " " + is_negative_zero(x));
x = -0/0;  write("-0/ 0 : " + x + " " + is_negative_zero(x));
x = 0/-0;  write(" 0/-0 : " + x + " " + is_negative_zero(x));
x = -0/-0; write("-0/-0 : " + x + " " + is_negative_zero(x));

x = 5/5;   write(" 5/ 5 : " + x + " " + is_negative_zero(x));
x = -5/5;  write("-5/ 5 : " + x + " " + is_negative_zero(x));
x = 5/-5;  write(" 5/-5 : " + x + " " + is_negative_zero(x));
x = -5/-5; write("-5/-5 : " + x + " " + is_negative_zero(x));

x = 0/5;   write(" 0/ 5 : " + x + " " + is_negative_zero(x));
x = -0/5;  write("-0/ 5 : " + x + " " + is_negative_zero(x));
x = 0/-5;  write(" 0/-5 : " + x + " " + is_negative_zero(x));
x = -0/-5; write("-0/-5 : " + x + " " + is_negative_zero(x));

// Mod
x = 0%0;   write(" 0% 0 : " + x + " " + is_negative_zero(x));
x = -0%0;  write("-0% 0 : " + x + " " + is_negative_zero(x));
x = 0%-0;  write(" 0%-0 : " + x + " " + is_negative_zero(x));
x = -0%-0; write("-0%-0 : " + x + " " + is_negative_zero(x));

x = 5%5;   write(" 5% 5 : " + x + " " + is_negative_zero(x));
x = -5%5;  write("-5% 5 : " + x + " " + is_negative_zero(x));
x = 5%-5;  write(" 5%-5 : " + x + " " + is_negative_zero(x));
x = -5%-5; write("-5%-5 : " + x + " " + is_negative_zero(x));

x = 0%5;   write(" 0% 5 : " + x + " " + is_negative_zero(x));
x = -0%5;  write("-0% 5 : " + x + " " + is_negative_zero(x));
x = 0%-5;  write(" 0%-5 : " + x + " " + is_negative_zero(x));
x = -0%-5; write("-0%-5 : " + x + " " + is_negative_zero(x));


y = 1 / (0 / -1); write(y + " " + (y === -Infinity));
y = 1 / (0 * -1); write(y + " " + (y === -Infinity));

y = 1 / (+0 / -1); write(y + " " + (y === Number.NEGATIVE_INFINITY));
y = 1 / (+0 * -1); write(y + " " + (y === Number.NEGATIVE_INFINITY));

y = 2 / (-5 % 5 ); write(y + " " + (y === Number.NEGATIVE_INFINITY));
y = -2/ (-5 % 5 ); write(y + " " + (y === Number.NEGATIVE_INFINITY));
y = 2 / (-5 %-5 ); write(y + " " + (y === Number.NEGATIVE_INFINITY));
y = -2/ (-5 %-5 ); write(y + " " + (y === Number.NEGATIVE_INFINITY));

    
function op_test() {
    var x = 0;
    var y = 0;

    if ( itself(1) )
    {
        x = 0;
        y = -1;
    }
    else
    {
        x = 5;
        y = 10;
    }
        
    var r;
    
    r = x * y; write(r + " " + is_negative_zero(r));
    r = x / y; write(r + " " + is_negative_zero(r));
    r = x % y; write(r + " " + is_negative_zero(r));
}

op_test();
