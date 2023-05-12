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

function makeArrayLength() {
}
function leaf() {
}
var arrObj0 = {};
var func0 = function (argFunc0, argArr1) {
    for (var _strvar0 in argArr1) {
        argArr1[_strvar0] = typeof f32[argArr1.pop() & 255];
    }
};
var func3 = function () {
    func0(leaf, ary);
};
arrObj0.method1 = func3;
var ary = new Array();
var f32 = new Float32Array();
var FloatArr0 = Array;
makeArrayLength({ prop1: arrObj0.method1(ary.splice(12, 14, arrObj0.method1())) });
try {
} catch (ex) {
} finally {
    try {
        obj6();
    } catch (ex) {
        var id32 = FloatArr0({ prop1: arrObj0.method1() });
    } finally {
    }
}

WScript.Echo('pass');