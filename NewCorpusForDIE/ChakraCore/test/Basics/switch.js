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

var x = { i : 0, j : 1 };
x.f = function(q) {
    WScript.Echo("x.f(" + q + ")");
    this.j++;
    return q;
}

switch (x.i) {
    default:
        WScript.Echo("default");
        break;
    case x.f(1.0):
        WScript.Echo(1.0);
        break;
    case x.f(x.i):
    case x.f(j):
        WScript.Echo(x.i);
        break;
}

switch (x.j) {
    default:
    case "melon":
        WScript.Echo("melon?");
        break;
    case x.f(0):
        WScript.Echo("0");
        break;
}   

WScript.Echo("x.i = " + x.i);
WScript.Echo("x.j = " + x.j);

switch(Math.sqrt(x.i)) {
    case Math.cos(x.j):
        break;
    case 1 ? 2 : 3:
        break;
    case "melon":
        break;
    default:
        WScript.Echo('here we are');
}

(function()
{
    var f = 0;
    switch (f)
    {
        case ((f = 1)? 0 : 0):
            WScript.Echo("pass");
            break;
        default:
            WScript.Echo("fail");
            break;
    };
})();
