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

var Arr = new Float64Array(100);
var Arr2 = new Array(100);
var Obj = new Object();

var Failed = 0;

function FAILED()
{
    Failed++;
    WScript.Echo("FAILED");
}

Obj.prop1 = 1;
Obj.prop2 = 1;
Obj.prop3 = 1;
Obj.prop4 = 1;
Obj.prop5 = 1;
Obj.prop6 = 1;
Obj.prop7 = 1;
Obj.prop8 = 1;

var x = 0.1;
var one = 1;

function init(o)
{
    for (var str in o)
    {
        o[str] = x * one;
    }
}

function verify(o)
{
    for (var str in o)
    {
        if (o[str] !== x)
        {
            FAILED();
        }
    }
}

// Build profile data
init(Arr);
// Init property string cache
init(Obj);
// Hit bug
init(Obj);

// Obj has garbage
verify(Obj);

if (Failed === 0)
{
    WScript.Echo("Passed");
}
