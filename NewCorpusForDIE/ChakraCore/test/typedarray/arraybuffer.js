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

WScript.Echo("new ArrayBuffer without argument");
var a = new ArrayBuffer();
WScript.Echo(a.byteLength);
a.byteLength = 999;
WScript.Echo(a.byteLength);

WScript.Echo("new ArrayBuffer with ulong argument");
var b = new ArrayBuffer(8);
WScript.Echo(b.byteLength);
b.byteLength = 999;
WScript.Echo(b.byteLength);

WScript.Echo("new ArrayBuffer with multiple arguments");
var c = new ArrayBuffer(9, 10, 11);
WScript.Echo(c.byteLength);
c.byteLength = 999;
WScript.Echo(c.byteLength);

WScript.Echo("new ArrayBuffer with string argument");
var d = new ArrayBuffer('20');
WScript.Echo(d.byteLength);
d.byteLength = 999;
WScript.Echo(d.byteLength);

WScript.Echo("new ArrayBuffer with invalid string argument");
var e = new ArrayBuffer('hello');
WScript.Echo(e.byteLength);
e.byteLength = 999;
WScript.Echo(e.byteLength);

WScript.Echo(e.toString());

WScript.Echo("a instanceof ArrayBuffer" + a instanceof ArrayBuffer);

for (i in d) {
WScript.Echo(i); 
}


WScript.Echo("arraybuffer.prototype")
var f = Object.getPrototypeOf(e);
var g = new f.constructor(20);
WScript.Echo(g)
WScript.Echo(g.byteLength);
WScript.Echo(typeof f);

WScript.Echo(ArrayBuffer.prototype[10]);
WScript.Echo(ArrayBuffer.prototype[-1]);
WScript.Echo(ArrayBuffer.prototype[2]);
ArrayBuffer.prototype[2] = 10;
WScript.Echo(ArrayBuffer.prototype[2]); 
