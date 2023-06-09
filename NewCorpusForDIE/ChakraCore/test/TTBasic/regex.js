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

var x = /World/;
var y = new RegExp("l", "g");
var z = new RegExp("l", "g");

y.exec("Hello World");
z.lastIndex = -1;

var re = /abc/i;
var re1 = new RegExp(re, "gm");

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`re.global == ${re.global}`, true); //false
    telemetryLog(`re.multiline == ${re.multiline}`, true); //false
    telemetryLog(`re.ignoreCase == ${re.ignoreCase}`, true); //true

    telemetryLog(`re1.global == ${re1.global}`, true); //true
    telemetryLog(`re1.multiline == ${re1.multiline}`, true); //true
    telemetryLog(`re1.ignoreCase == ${re1.ignoreCase}`, true); //false

    telemetryLog(`y.lastIndex: ${y.lastIndex}`, true); //3
    telemetryLog(`z.lastIndex: ${z.lastIndex}`, true); //3

    ////
    var m = "Hello World".match(x);
    y.exec("Hello World");
    ////

    telemetryLog(`m.index: ${m.index}`, true); //6
    telemetryLog(`post update -- y.lastIndex: ${y.lastIndex}`, true); //4

    emitTTDLog(ttdLogURI);
}