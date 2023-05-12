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

/*
This file is executed from fabs1.js

fabs from ucrtbase.dll doesn't restore the FPU Control word correctly when passed a NaN. 
This is exposed if we WScript.LoadScriptFile() code with Math.Abs(NaN) in it. 
Causing an assertion failure in SmartFPUControl. The change special-handles NaN without calling fabs
*/

function testOp(av) {
    return Math.abs(av);
}

WScript.Echo(testOp(123.334) === 123.334);
WScript.Echo(testOp(-123.334) === 123.334);
WScript.Echo(isNaN(testOp(NaN)));
WScript.Echo(isNaN(testOp(-NaN)));
WScript.Echo(testOp(Infinity) === Infinity);
WScript.Echo(testOp(-Infinity) === Infinity);
WScript.Echo(testOp(0.0) === 0.0);
WScript.Echo(testOp(-0.0) === 0.0);

