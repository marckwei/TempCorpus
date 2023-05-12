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

var A = new Array(10);
A[1] = 100;
Array.prototype[5] = 50;
var Failed = 0;

function FAIL()
{
    Failed++;
    WScript.Echo("FAILED");
}

function foo(arr, i, expected)
{
    var z = 0;
    for(var j = 0;j<10;j++){
        arr = arr[i];
        z += arr + 10;
        arr = A;
    }
    if (z != expected)
    {
        FAIL();
    }

    return i;
}
// generate profile
for(var i=0;i<200;i++)
{
    foo(A, 5, 600);
}

Object.defineProperty(A,5,{get:function(){return 200}});

for(var i=0;i<200;i++)
{
    foo(A, 5, 2100);
}

if (!Failed)
{
    WScript.Echo("Passed");
}