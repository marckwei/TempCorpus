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
a = -3963;
b = 48185;
c = 39331;
d = 4591;
e = 35663;
f = 65144;
g = -20692;
h = 8451;
obj0.a = 40687;
obj0.b = 32784;
obj0.c = -25143;
obj0.d = -17625;
obj0.e = -51487;
ary[0] = -29637;
ary[1] = 15313;
ary[100] = -38796;
b = obj0.d;
d = (! (obj0.c & obj0.b));
e = ((obj0.b - ((15848 * g) | (g * g))) * (obj0.a * c));
if(((((-22473 ? 13469 : a) * (obj0.d + obj0.d)) + d) != (((-22045 == -5074) | (-15244 + 39567)) * ((c <= -49617) ? f : obj0.b)))) {
} else {
}
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
