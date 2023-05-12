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

//===============================================
// No fast path - because its a negative index
//===============================================
var a = new Array();

a[3221225472] = 3;      // Index 0xC0000000

// non type-specialized case
index = -1073741824;    // Index 0xC0000000, but signed
WScript.Echo(a[index]);

// int const case
WScript.Echo(a[-1073741824]);

// Type Specialized case
var G = 1;
function foo()
{
    var i = 0;
    if (G) i = -1073741824;
    WScript.Echo(a[i]);
}
foo();

//===============================================
// Fast path
//===============================================
var b = new Array();
a[3] = 3;
WScript.Echo(a[3]);
function foo2()
{
    var i = 0;
    if (G) i = 3;
    WScript.Echo(a[i]);
}
foo2();

