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

var x = new Set();
var y = x;
y.baz = 5;

var z = new Set();
z.add(5);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`x === y: ${x === y}`, true); //true
    telemetryLog(`x.baz: ${x.baz}`, true); //5
    telemetryLog(`z.size: ${z.size}`, true); //1
    telemetryLog(`z.has(5): ${z.has(5)}`, true); //true

    ////
    x.add(3);
    z.delete(3);
    z.delete(5);
    ////

    telemetryLog(`post update 1 -- y.has(3): ${y.has(3)}`, true); //true
    telemetryLog(`post update 1 -- z.size: ${z.size}`, true); //0
    telemetryLog(`post update 1 -- z.has(5): ${z.has(5)}`, true); //false

    ////
    y.add(3);
    y.add(5);
    ////

    telemetryLog(`post update 2 -- x.has(5): ${x.has(5)}`, true); //true
    telemetryLog(`post update 2 -- x.size: ${x.size}`, true); //2

    emitTTDLog(ttdLogURI);
}