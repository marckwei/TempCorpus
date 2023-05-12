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

//Baseline switches:
//Switches: -mic:1 -off:simplejit
var Float64ArrayView = new Float64Array();
var Int32ArrayView = new Int32Array();

function m(v) {
  Float64ArrayView[0x4 * (0x80000001 >> !1) >> 0] = v;
  Int32ArrayView[0x4 * (0x80000001 >> !1) >> 0] = v;
}

var val = 3.1415926535;
m(val);
val = 123456789.123456789;
m(val);

Float64ArrayView = new Float64Array(16);
Int32ArrayView = new Int32Array(16);
val = 987654321.987654321;
m(val);
if (Float64ArrayView[4] === val && Int32ArrayView[4] === (val | 0)) {
  print("PASSED");
} else {
  print(Float64ArrayView[4]);
  print(Int32ArrayView[4]);
  print("FAILED");
}
