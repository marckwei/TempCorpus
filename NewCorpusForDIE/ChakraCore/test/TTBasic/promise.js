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

var p1 = new Promise((resolve, reject) => resolve(5));  
var p2 = p1.then((val) => { return val + 1; }); // 5  

var p3 = new Promise((resolve, reject) => resolve(10));

var v1 = undefined;
var v2 = undefined;
var v3 = undefined;

function doIt()
{
    p1.then((val) => v1 = val);
    p2.then((val) => v2 = val);
    p3.then((val) => v3 = val);
    
    WScript.SetTimeout(testFunction, 50);
}

WScript.SetTimeout(doIt, 50);

function testFunction()
{            
    telemetryLog(`v1: ${v1}`, true); //5
    telemetryLog(`v2: ${v2}`, true); //6
    telemetryLog(`v3: ${v3}`, true); //10

    emitTTDLog(ttdLogURI);
}


