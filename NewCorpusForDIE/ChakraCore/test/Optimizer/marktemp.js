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

var x1;
var x2;
function foo1()
{
    var i, a, tmp;
    a = 1.0;

    for (i = 0; i != 2; i++)
    {
        if (i == 1) {
               x1 = a + 1.1;
        }
        tmp = i + 1.1;
        a = tmp;
    }
}

function foo2()
{
    var i, a, tmp;
    a = 1.0;

    for (i = 0; i != 2; i++)
    {
        if (i == 1) {
               x2 = a;
        }
        tmp = i + 1.1;
        a = tmp;
    }
}

function foo3()
{
    var i,a;
    i = x1;
    for (var j = 0; j < 2; j++)
    {
        i = 3 + i;
        if (j == 0)
        {
           a = i;
    }
    }
    if (a != 5.2 || i != 8.2) {
        return false;
    }
    return true;
}
foo1();
foo2();

if (x1 != 2.2 || x2 != 1.1 || !foo3())
{
    WScript.Echo("FAILED");
}
else
{
    WScript.Echo("Pass");
}
