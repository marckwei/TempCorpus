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

var x = 3;
var y = 5;

var xd = 4.6;
var yd = 9.2;

var myInf = Infinity;

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`x: ${x}`, true); //3
    telemetryLog(`y: ${y}`, true); //5
    telemetryLog(`xd: ${xd}`, true); //4.6
    telemetryLog(`yd: ${yd}`, true); //9.2

    telemetryLog(`x + y: ${x + y}`, true); //8
    telemetryLog(`x - y: ${x - y}`, true); //-2
    telemetryLog(`x * y: ${x * y}`, true); //15
    telemetryLog(`x / y: ${x / y}`, true); //0.6

    telemetryLog(`isFinite(xd): ${isFinite(xd)}`, true); //true
    telemetryLog(`isFinite(myInf): ${isFinite(myInf)}`, true); //false
    telemetryLog(`isFinite(Infinity): ${isFinite(Infinity)}`, true); //false

    telemetryLog(`Math.abs(-2): ${Math.abs(-2)}`, true); //2
    telemetryLog(`Math.floor(1.5): ${Math.floor(1.5)}`, true); //1.0

    emitTTDLog(ttdLogURI);
}