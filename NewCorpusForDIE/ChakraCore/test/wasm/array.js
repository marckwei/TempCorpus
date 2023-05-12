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

var mod = new WebAssembly.Module(readbuffer('array.wasm'));
var a = new WebAssembly.Instance(mod).exports;
print(a["goodload"](0));
try {
  print(a["badload"](0));
}
catch(e) {
  print(e.message.includes("out of range") ? "PASSED" : "FAILED");
}
try {
  a["badstore"](0);
}
catch(e) {
  print(e.message.includes("out of range") ? "PASSED" : "FAILED");
}
a.goodload(65535)
try {
a.goodload(65536)
}
catch(e) {
  print(e.message.includes("out of range") ? "PASSED" : "FAILED");
}
a.goodstore(0)
a.goodstore(65535)
try {
a.goodstore(65536)
}
catch(e) {
  print(e.message.includes("out of range") ? "PASSED" : "FAILED");
}
