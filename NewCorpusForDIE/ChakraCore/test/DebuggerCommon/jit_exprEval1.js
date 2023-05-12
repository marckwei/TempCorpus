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

// Validation of expression evaluation in the Jit frame.

function F2() {
    var a = new Array;                       
    var sub = -10;                            /**bp:locals();
                                                setFrame(1);locals(1);
                                                evaluate('obj1',1);evaluate('b1');evaluate('obj4');
                                                setFrame(2);locals(1);evaluate('x');evaluate('y.y1=3');evaluate('y',1);evaluate('x+y.y1');**/
}

function F3(r) {
    return 2 * 3.14 * r;
}

function F5() {
    var x = 20;     
    var y = {y1:1}; 
    var t1 = Math.abs(22.2);
    
    var f6 = function (arg) {
        var b1 = 10;
        var obj1 = {a1:x};
        var obj4 = F3(obj1.a1);
        return b1 + F2();
    }
    f6(t1);
    return y;
}

function Run(arg1, arg2, arg3)
{
    F5();
}

Run(12, "assdf", 112);
Run([3,5,8], {a:"aa"}, 21);

function Bar (c)
{
    var m = 10;
    return m;       /**bp:evaluate('m');locals();setFrame(1);locals(1)**/
}

function F6() {
    var x = 2;
    Bar.apply(this, arguments); 
}
F6();
F6(1,4);

WScript.Echo("Pass");
