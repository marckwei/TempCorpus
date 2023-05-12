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

var bx = new ArrayBuffer(16);
var by = bx;

var bz = new ArrayBuffer(16);

var viewx = new Int32Array(bx);
var viewy = new Int8Array(by, 4, 12);

var viewz = new Float32Array(bz);

for(var i = 0; i < viewx.length; ++i) 
{
    viewx[i] = i + 1;
}

for(var i = 0; i < viewz.length; ++i) 
{
    viewz[i] = i / 2.0;
}

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`viewx.length: ${viewx.length}`, true); //4
    telemetryLog(`viewy.length: ${viewy.length}`, true); //12
    telemetryLog(`bx === by: ${bx === by}`, true); //true
    telemetryLog(`viewx.buffer === viewy.buffer: ${viewx.buffer === viewy.buffer}`, true); //true

    var allokx = true;
    for(var i = 0; i < viewx.length; ++i) 
    {
        allokx = allokx && (viewx[i] === i + 1);
    }
    telemetryLog(`allokx: ${allokx}`, true); //true

    telemetryLog(`viewz.length: ${viewz.length}`, true); //4

    var allokz = true;
    for(var i = 0; i < viewz.length; ++i) 
    {
        allokz = allokz && (viewz[i] === i / 2.0);
    }
    telemetryLog(`allokz: ${allokz}`, true); //true

    ////
    viewx[1] = 0;
    ////

    telemetryLog(`viewy[0]: ${viewy[0]}`, true); //0
    telemetryLog(`viewy[1]: ${viewy[1]}`, true); //0
    telemetryLog(`viewy[2]: ${viewy[2]}`, true); //0
    telemetryLog(`viewy[3]: ${viewy[3]}`, true); //0

    ////
    viewz[0] = 0.5;
    ////

    telemetryLog(`viewz[0]: ${viewz[0]}`, true); //0.5

    emitTTDLog(ttdLogURI);
}