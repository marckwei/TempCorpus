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
// Copyright (C) Microsoft Corporation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var mod = new WebAssembly.Module(readbuffer('misc.wasm'));
var a = new WebAssembly.Instance(mod).exports;
print(a.f32copysign(-40.0,2.0)); // == 40.0
print(a.f32copysign(-40.0,-2.0)); // == -40.0
print(a.f32copysign(-1.0,2.0)); // == 1.0
print(a.f32copysign(-1.0,-2.0)); // == -1.0
print(a.f32copysign(255.0,-1.0)); // == -255.0
print(a.f32copysign(255.0,1.0)); // == 255.0
print(a.eqz(0)); // == 1
print(a.eqz(-1)); // == 0
print(a.eqz(1)); // == 0
print(a.trunc(0.5)); // == 0
print(a.trunc(-1.5)); // == -1
print(a.trunc(NaN)); // == NaN
print(a.trunc(-NaN)); // == NaN
print(a.trunc(Infinity)); // == Infinity
print(a.trunc(-Infinity)); // == -Infinity
print(a.f64trunc(0.5)); // == 0
print(a.f64trunc(-1.5)); // == -1
print(a.f64trunc(NaN)); // == NaN
print(a.f64trunc(-NaN)); // == NaN
print(a.f64trunc(Infinity)); // == Infinity
print(a.f64trunc(-Infinity)); // == -Infinity
print(a.ifeqz(0)); // == 1
print(a.ifeqz(-1)); // == 0
print(a.nearest(-0.1)); // == 0
print(a.nearest(-0.7)); // == -1
print(a.nearest(-1.5)); // == -2
print(a.nearest(NaN)); // == NaN
print(a.nearest(-NaN)); // == NaN
print(a.nearest(Infinity)); // == Infinity
print(a.nearest(-Infinity)); // == -Infinity
print(a.f64nearest(-0.1)); // == 0
print(a.f64nearest(-0.7)); // == -1
print(a.f64nearest(-1.5)); // == -2
print(a.f64nearest(NaN)); // == NaN
print(a.f64nearest(-NaN)); // == NaN
print(a.f64nearest(Infinity)); // == Infinity
print(a.f64nearest(-Infinity)); // == -Infinity
print(a.f64copysign(255.0,-1.0)); // == -255.0
