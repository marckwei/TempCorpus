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

function foo(x) {
    this.x = x;
}

var f = new foo(10);

foo.prototype = { y : 10 };

var f1 = new foo(20);

function bar(x, y) {
    this.x1 = x;
    this.x2 = x;
    this.x3 = x;
    this.x4 = x;
    this.x5 = x;
    this.x6 = x;
    this.x7 = x;
    this.x8 = x;
    this.x9 = x;
    
    this.y1 = y;
    this.y2 = y;
    this.y3 = y;
    this.y4 = y;
    this.y5 = y;
    this.y6 = y;
    this.y7 = y;
    this.y8 = y;
    this.y9 = y;
}

var b1 = new bar(10, 20);
var b2 = new bar(30, 40);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`f.y ${f.y}`, true);
    telemetryLog(`f1.y ${f1.y}`, true);
    telemetryLog(`b2.y8 ${b2.y8}`, true);

    emitTTDLog(ttdLogURI);
}