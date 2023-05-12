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

function DumpArray(array)
{
    WScript.Echo("[" + array.join(",") + "]");
}

function literalOfInts()
{
    var array = [3, 4, 5, 6, 7, 8];
    DumpArray(array);

    var array_large = [3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8,
    3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8];
    DumpArray(array_large);
}

function literalOfFloats()
{
    var array = [3.5, 4, 5, 6, 7, 23.23];
    DumpArray(array);

    // more than 64 elements
    var array_large = [3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23,
    3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23, 3.5, 4, 5, 6, 7, 23.23];
    DumpArray(array_large);
}

function otherLiteral()
{
    var array = [];
    DumpArray(array);

    array[3] = 32;
    DumpArray(array);

    var array1 = [new Object()];
    var array1 = [new Object()];
}

function complexLiteral()
{
    var array = [new Object(), 4, function() {}, 6, 7, 23.23];
    DumpArray(array);

    // Make the array1 itself dead and ensure that the code still works correctly with -recyclerstress
    var array1 = [new Object(), 4, function() {}, 6, 7, 23.23];
    var array1 = [new Object(), 4, function() {}, 6, 7, 23.23];
}

literalOfInts();
literalOfFloats();
otherLiteral();
complexLiteral();
