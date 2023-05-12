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

var x = "x.original";

var reset = function () {
    x = "x.original";
}

var test = function () {
    var z = "z.original";
    function innerTest() {
        x = "x.overwritten";
        z = x;
    }
    innerTest();
    return z;
}

test();
reset();

test();
reset();

function makeGlobalPropertyReadOnly(p) {
    Object.defineProperty(this, p, { writable: false });
}

function reportGlobalPropertyDescriptor(p) {
    WScript.Echo(p + ".configurable = " + Object.getOwnPropertyDescriptor(this, p).configurable);
    WScript.Echo(p + ".writable = " + Object.getOwnPropertyDescriptor(this, p).writable);
}

reportGlobalPropertyDescriptor("x");

makeGlobalPropertyReadOnly("x");
reportGlobalPropertyDescriptor("x");

var result = test();
WScript.Echo("x: " + x);
WScript.Echo("result: " + result);
