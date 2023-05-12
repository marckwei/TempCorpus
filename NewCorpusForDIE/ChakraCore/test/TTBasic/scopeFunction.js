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

function outer(val)
{
    var iic = val + 1;

    function inner() { return iic++; }

    return inner;
}
var fouter = outer(3);
var gouter = outer(5);

function ctr(val)
{
    var iic = val;

    this.inc = function () { return iic++; }
    this.dec = function () { return iic--; }
}
var fctr = new ctr(3);
var fctr2 = fctr;
var gctr = new ctr(5);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    ////
    fouter();
    ////

    telemetryLog(`fouter(): ${fouter()}`, true); //5
    telemetryLog(`gouter(): ${gouter()}`, true); //6

    ////
    fctr.inc();
    ////

    telemetryLog(`fctr.inc(): ${fctr.inc()}`, true); //4
    telemetryLog(`gctr.inc(): ${gctr.inc()}`, true); //5

    ////
    fctr2.dec();
    fctr2.dec();
    ////

    telemetryLog(`post decrement -- fctr.inc(): ${fctr.inc()}`, true); //3
    telemetryLog(`post decrement -- gctr.inc(): ${gctr.inc()}`, true); //6

    emitTTDLog(ttdLogURI);
}