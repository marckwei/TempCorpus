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

var A = new Float64Array(100);
var str = "123.12";

function FAIL(x, y)
{
    WScript.Echo("FAILED\n");
    WScript.Echo("Expected "+y+", got "+x+"\n");
    throw "FAILED";
}

function foo()
{
    var y = 0.1;
    for (var i = 0; i < 100; i+=4) {
        A[i] = i;
    A[i+1] = i + 0x7ffffff0;
        A[i+2] = i+0.34;
    A[i+3] = str;
    }

    for (var i = 0; i < 100; i++)
    {
        y += A[i];
    A[i] = 0;
    }
    return y;
}

var expected = 53687097486.59999;
var r;

for (var i = 0; i < 1000; i++)
{
    r = foo();

    if (r !== expected)
        FAIL(r, expected);
}

WScript.Echo("Passed\n");
