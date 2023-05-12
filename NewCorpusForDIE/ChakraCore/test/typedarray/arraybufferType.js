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

var d = ArrayBuffer.prototype;
WScript.Echo(d);
d.aaa = 20;
var a = Object.getPrototypeOf(new Int8Array(1).buffer);
a.foo = 20;
a.bar = 42;
WScript.Echo(a);
WScript.Echo(a.foo);
var b = Object.getPrototypeOf(new Int16Array(0).buffer);
WScript.Echo(b);
for (var i in b)
{
WScript.Echo(i + ' = ' + b[i]);
}
WScript.Echo(b.foo);
var c = Object.getOwnPropertyNames(b);
for (var i in c) 
{
WScript.Echo(c[i]);
}

WScript.Echo(a == b);

var e = new Int32Array(0).buffer.constructor.prototype;
WScript.Echo(e.foo);
for (var i in e)
{
WScript.Echo(i + ' = ' + e[i]);
}
var ee = Object.getOwnPropertyNames(e);
for (var i in ee) 
{
WScript.Echo(ee[i]);
}
