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

// Verify that the starting index param to indexOf is respected for sparse arrays

var a = new Array(0, 1);
a[4294967294] = 2;          // 2^32-2 - is max array element
a[4294967295] = 3;          // 2^32-1 added as non-array element property
a[4294967296] = 4;          // 2^32   added as non-array element property
a[4294967297] = 5;          // 2^32+1 added as non-array element property

print(a.indexOf(2, 4294967290)); // === 4294967294 &&
print(a.indexOf(3, 4294967290)); // === -1 &&
print(a.indexOf(4, 4294967290)); // === -1 &&
print(a.indexOf(5, 4294967290)); // === -1   ) ;

a[1111111] = 2;
a[1111112] = 3;
a[1111113] = 4;
a[1111114] = 5;

print(a.indexOf(2, 4294967290)); // === 4294967294 &&
print(a.indexOf(3, 4294967290)); // === -1 &&
print(a.indexOf(4, 4294967290)); // === -1 &&
print(a.indexOf(5, 4294967290)); // === -1   ) ;
