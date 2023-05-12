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

function isnegativezero(x)
{
    // this is a quick way to check if a number is -0
    return !(x != 0 || 1/x >= 0)
}

function test(value, expected)
{
    var result = value | 0;     // ToInt32
    if (!(result === expected && isnegativezero(result) === isnegativezero(expected)))
    {
        throw new Error(`toInt32 failed on ${value}`);
    }
}
var negZero = -0.0;

test(0.0, 0.0);
test(-0.0, 0.0);
test(0.1, 0);
test(-0.1, 0);
test(1.1, 1);
test(-1.1, -1);
test(4294967295.5, -1);
test(-4294967295.5, 1);
test(4294967296, 0);
test(-4294967296, 0);
test(4294967297.1, 1);
test(-4294967297.1, -1);
test(2147483647, 2147483647);
test(2147483648, -2147483648);
test(Number.NEGATIVE_INFINITY, 0);
test(Number.POSITIVE_INFINITY, 0);
test(Number.NaN, 0);

// We start losing precision here
test(2147483647 * 2147483647 + 1024, 1024);

// MAX 64-bit integer - 1024
test(9223372036854775000, -1024);
test(-9223372036854775000, 1024);

// > 64-bit
test(9223372036854776000, 0);
test(9223372036854777000, 2048);
test(9223372036854778000, 2048);
test(-9223372036854776000, 0);
test(-9223372036854777000, -2048);
test(-9223372036854778000, -2048);

print("pass");
