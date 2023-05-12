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

var a = {x:20, y:30};
Object.freeze(a);

var b = {x:20, y:30};
Object.freeze(b);

var c = {x:20, y:30};
Object.freeze(c);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    a.z = 50;
    try 
    {
        Object.defineProperty(a, 'ohai', { value: 17 });
    }
    catch(e)
    {
        telemetryLog(`${e}`, true);
    }

    telemetryLog(`${Object.getOwnPropertyNames(a)}`, true);
    telemetryLog(`${Object.isFrozen(a)}`, true);

    delete b.x;
    telemetryLog(`${Object.getOwnPropertyNames(b)}`, true);
    telemetryLog(`${Object.isFrozen(b)}`, true);
    telemetryLog(`${b.x}`, true);

    a.c = 40;
    a.c = 60;
    telemetryLog(`${Object.getOwnPropertyNames(c)}`, true);
    telemetryLog(`${Object.isFrozen(c)}`, true);
    telemetryLog(`${c.x}`, true);

    emitTTDLog(ttdLogURI);
}