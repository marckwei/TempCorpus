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
a = -10384;
b = -48733;
c = -46839;
d = -49;
e = -28236;
f = -50682;
g = 61069;
h = 45170;
obj0.a = 31288;
obj0.b = 25293;
obj0.c = 65162;
obj0.d = 15672;
obj0.e = 662;
ary[0] = 41944;
ary[1] = -64348;
ary[100] = -13076;
if(((a ^ (d - (obj0.c | -64702))) == ((obj0.b > obj0.c) + b))) {
} else {
}
e = (((h | (obj0.b >= obj0.d)) | ((obj0.c + 3291) <= a)) & (((63006 | 26489) ^ (-2564 * g)) | (+ (obj0.c | a))));
b = obj0.c;
h = obj0.a;
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
