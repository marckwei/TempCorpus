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

function test0(a) {
    a[1];
    a.reverse();
    return a[0];
}
WScript.Echo("test0: " + test0([2, 3]));
WScript.Echo("test0: " + test0([2, 3]));

function test1(a) {
    a[1];
    a.shift();
    return a[0];
}
WScript.Echo("test1: " + test1([2, 3]));
WScript.Echo("test1: " + test1([2, 3]));

function test2(a) {
    a[1];
    var b = a.slice(0, 0);
    return a[0];
}
WScript.Echo("test2: " + test2([2, 3]));
WScript.Echo("test2: " + test2([2, 3]));

function test3(a) {
    a[1];
    a.splice(0, 0);
    return a[0];
}
WScript.Echo("test3: " + test3([2, 3]));
WScript.Echo("test3: " + test3([2, 3]));

function test4(a) {
    a[1];
    a.unshift();
    return a[0];
}
WScript.Echo("test4: " + test4([2, 3]));
WScript.Echo("test4: " + test4([2, 3]));
