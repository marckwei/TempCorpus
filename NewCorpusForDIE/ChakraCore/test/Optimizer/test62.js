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

(function() {
var ary = new Array(10);
var obj0 = new Object();
var a;
var b;
var c;
var d;
var e;
var f;
var g;
var h;
a = 63420;
b = 61604;
c = -53508;
d = 37352;
e = -63704;
f = 53501;
g = -27146;
h = 17398;
obj0.a = 65323;
obj0.b = 65298;
obj0.c = -55245;
obj0.d = -49588;
obj0.e = -54546;
ary[0] = 49077;
ary[1] = 7838;
ary[100] = -22852;
obj0.e = ((((e <= 23470) ? obj0.a : (-25647 * c)) & (c | (-30314 * d))) | (a & a));
if(((obj0.e * obj0.e) <= ((obj0.c + -59742) | -21885))) {
} else {
}
obj0.b = d;
obj0.b = ((((7564 != a) ? (-27661 + -22036) : (obj0.c | c)) | obj0.c) * (46343 * ((44509 ^ c) ^ obj0.b)));
WScript.Echo("a = " + (a>>3));
WScript.Echo("b = " + (b>>3));
WScript.Echo("c = " + (c>>3));
WScript.Echo("d = " + (d>>3));
WScript.Echo("e = " + (e>>3));
WScript.Echo("f = " + (f>>3));
WScript.Echo("g = " + (g>>3));
WScript.Echo("h = " + (h>>3));
WScript.Echo("obj0.a = " + (obj0.a>>3));
WScript.Echo("obj0.b = " + (obj0.b>>3));
WScript.Echo("obj0.c = " + (obj0.c>>3));
WScript.Echo("obj0.d = " + (obj0.d>>3));
WScript.Echo("obj0.e = " + (obj0.e>>3));
WScript.Echo("ary[0] = " + (ary[0]>>3));
WScript.Echo("ary[1] = " + (ary[1]>>3));
WScript.Echo("ary[100] = " + (ary[100]>>3));
WScript.Echo('done');
})();
