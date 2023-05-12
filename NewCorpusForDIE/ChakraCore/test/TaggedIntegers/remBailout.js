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

var NotNegZero = 0;
var NegZero = 0;

function checkisnegativezero(x, str)
{
    // this is a quick way to check if a number is -0
    if(x != 0 || 1/x >= 0)
    {
        NotNegZero++;
    }
    else 
    {
        NegZero++;
    }
}

var Y = 0;
var X = -5;
var one = 1;

var A = new Array();
function foo(x, y) {
    checkisnegativezero(x % y);
    foo2(x);
}
function foo2(x) {
    checkisnegativezero(x % 2);
}


for (var i = 0; i < 2000; i++)
    foo(2, 2);

foo(-2, 2);

if (NotNegZero != 4000 || NegZero != 2)
    WScript.Echo("FAILED\n");
else
    WScript.Echo("Passed\n");
