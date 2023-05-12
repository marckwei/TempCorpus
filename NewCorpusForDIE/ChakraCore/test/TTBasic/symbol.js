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

var x = 'Hello';

var xs = Symbol("Hello");
var ys = xs;

var zs = Symbol("Hello");

var obj = {};
obj[x] = 1;
obj[xs] = 2;
obj[zs] = 3;

var symObj = Object(zs);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`typeof zs: ${typeof(zs)}`, true); //symbol
    telemetryLog(`typeof symObj: ${typeof(symObj)}`, true); //object
    
    telemetryLog(`xs == ys: ${xs == ys}`, true); //true
    telemetryLog(`xs == zs: ${xs == zs}`, true); //false

    telemetryLog(`obj[x]: ${obj[x]}`, true); //1
    telemetryLog(`obj.Hello: ${obj.Hello}`, true); //1

    telemetryLog(`obj[xs]: ${obj[xs]}`, true); //2
    telemetryLog(`obj[ys]: ${obj[ys]}`, true); //2

    telemetryLog(`obj[zs]: ${obj[zs]}`, true); //3
    telemetryLog(`obj[symObj]: ${obj[symObj]}`, true); //3

    emitTTDLog(ttdLogURI);
}