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

var xb = new Boolean(true);
var yb = xb;
yb.foob = 3;

var zb = new Boolean(true);

var xn = new Number(5);
var yn = xn;
yn.foon = 3;

var zn = new Number(5);

var xs = new String("bob");
var ys = xs;
ys.foos = 3;

var zs = new String("bob");

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    telemetryLog(`typeof (xb): ${typeof (xb)}`, true); //object"
    telemetryLog(`xb === yb: ${xb === yb}`, true); //true
    telemetryLog(`xb !== zb: ${xb !== zb}`, true); //true
    telemetryLog(`xb == true: ${xb == true}`, true); //true
    telemetryLog(`xb === true: ${xb === true}`, true); //false
    telemetryLog(`xb.foob: ${xb.foob}`, true); //3

    telemetryLog(`typeof (xn): ${typeof (xn)}`, true); //object"
    telemetryLog(`xn === yn: ${xn === yn}`, true); //true
    telemetryLog(`xn !== zn: ${xn !== zn}`, true); //true
    telemetryLog(`xn == 5: ${xn == 5}`, true); //true
    telemetryLog(`xn === 5: ${xn === 5}`, true); //false
    telemetryLog(`xn.foon: ${xn.foon}`, true); //3

    telemetryLog(`typeof (xs): ${typeof (xs)}`, true); //object"
    telemetryLog(`xs === ys: ${xs === ys}`, true); //true
    telemetryLog(`xs !== zs: ${xs !== zs}`, true); //true
    telemetryLog(`xs == \'bob\': ${xs == "bob"}`, true); //true
    telemetryLog(`xs === \'bob\': ${xs === "bob"}`, true); //false
    telemetryLog(`xs.foos: ${xs.foos}`, true); //3

    emitTTDLog(ttdLogURI);
}