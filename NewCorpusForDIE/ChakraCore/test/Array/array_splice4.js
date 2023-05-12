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

// BLUE#5602: User Mode Write AV starting at Js::SparseArraySegment::EnsureSizeInBound+0x000000000000001a (Hash=0x3c06064b.0x23355e69)
var echo=WScript.Echo

function func2()
{}

// from bug BLUE 5602
function func()
{
    e="div".match(func2());
echo("e = " + e + " ; e.length = " + e.length);
    e.length=58;
echo("e = " + e + " ; e.length = " + e.length);
    e.splice(1);//es.splice(1,17); is OK too
echo("e = " + e + " ; e.length = " + e.length);
}

// from bug BLUE 5602
function func_test2()
{
    e="div".match(func2());
echo("e = " + e + " ; e.length = " + e.length);
    e.length=58;
echo("e = " + e + " ; e.length = " + e.length);
    e.splice(1,17);
echo("e = " + e + " ; e.length = " + e.length);
}

function start()
{
  echo ("start- func()");
  func();
  echo ("start- func_test2()");
  func_test2();
  echo ("start- done");
}

start();
