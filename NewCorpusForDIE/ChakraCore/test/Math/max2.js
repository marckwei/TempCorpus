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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

// @ts-check

function AssertNaN(value) {
    if (!isNaN(value))
        throw new Error("Expected NaN as value");
}

let valueOfCounter = 0;
const obj = {
    valueOf: function () {
        valueOfCounter++;
        return 1;
    }
};

AssertNaN(Math.max(NaN, obj));
AssertNaN(Math.max(NaN, NaN));
AssertNaN(Math.max(NaN, NaN, obj));
AssertNaN(Math.max(NaN, NaN, NaN));

AssertNaN(Math.min(NaN, obj));
AssertNaN(Math.min(NaN, NaN));
AssertNaN(Math.min(NaN, NaN, obj));
AssertNaN(Math.min(NaN, NaN, NaN));

const expectedCount = 4;
if (valueOfCounter != expectedCount)
    throw new Error(`Expected "valueOf" to be called ${expectedCount}x; got ${valueOfCounter}`);

console.log("pass");
