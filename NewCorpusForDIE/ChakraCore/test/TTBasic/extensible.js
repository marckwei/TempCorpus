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
Object.preventExtensions(a);

var b = {x:20, y:30};
Object.preventExtensions(b);

var c = {x:20, y:30};
Object.preventExtensions(c);

var d = {x:20, y:30};
Object.preventExtensions(d);

var e = {get x() {return 0;}, y:30};
Object.preventExtensions(e);

WScript.SetTimeout(testFunction, 50);

/////////////////

function testFunction()
{
    a.z = 50;
    telemetryLog(`${Object.getOwnPropertyNames(a)}`, true);
    telemetryLog(`${Object.isExtensible(a)}`, true);

    delete b.x;
    telemetryLog(`${b.x}`, true);
    telemetryLog(`${Object.isExtensible(b)}`, true);

    c.x = 40;
    c.y = 60;
    telemetryLog(`${Object.getOwnPropertyNames(c)}`, true);
    telemetryLog(`${Object.isExtensible(c)}`, true);
    telemetryLog(`${c.x}`, true);

    delete d.x;
    Object.defineProperty(d, "y", {configurable: false});
    telemetryLog(`${Object.isSealed(d)}`, true);
    Object.defineProperty(d, "y", {writable: false});
    telemetryLog(`${Object.isFrozen(d)}`, true);

    delete e.x;
    Object.defineProperty(e, "y", {configurable: false});
    telemetryLog(`${Object.isSealed(e)}`, true);
    Object.defineProperty(e, "y", {writable: false});
    telemetryLog(`${Object.isFrozen(e)}`, true);

    emitTTDLog(ttdLogURI);
}