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

//
//In theory this test could be race-y -- in which case suppress the console printing but in general ch should be well behaved
//

telemetryLog("Start Global Code", true);

function foo1()
{
    telemetryLog("Start Foo1", true);
    
    WScript.Echo("Hello World - CallBack 1");
    
    telemetryLog("End Foo1", true);
}

function foo2()
{
    telemetryLog("Start Foo2", true);
    
    WScript.Echo("Hello World - CallBack 2");
    
    telemetryLog("End Foo2", true);
}

function foo3()
{
    telemetryLog("Start Foo3", true);
    
    WScript.Echo("Hello World - CallBack 3");
    
    telemetryLog("End Foo3", true);

    emitTTDLog(ttdLogURI);
}

WScript.SetTimeout(foo1, 200);
WScript.SetTimeout(foo2, 400);
WScript.SetTimeout(foo3, 600);
WScript.Echo("Hello World - Global");

telemetryLog("End Global Code", true);

