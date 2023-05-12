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

function f0(a, start, end) {
    for (var i = start, j = start; i < end; i++, j++) {
        j = j + 1
        a[i] = 1
    }
    a[j]
    print(j)

}

function f1(a, start, end) {
    for (var i = start, j = start; i < end; i++, j++) {
        j = j + 2
        a[i] = 1
    }
    a[j]
    print(j)

}

function f2(a, start, end) {
    for (var i = start, j = start; i >= end; i--, j--) {
        j = j - 1
        a[i] = 1
    }
    a[j]
    print(j)
}

function f3(a, start, end) {
    for (var i = start, j = start; i >= end; i--, j--) {
        j = j - 2
        a[i] = 1
    }
    a[j]
    print(j)
}

function f4(a, start, end) {
    for (var i = start, j = start; i < end; i++, j--) {
        j = j + 1
        a[i] = 1
    }
    a[j]
    print(j)
}

function f5(a, start, end) {
    for (var i = start, j = start; i < end; i++, j--) {
        j = j + 2
        a[i] = 1
    }
    a[j]
    print(j)
}

var a = new Float64Array(0xfff);
f0(a, 0, 100)
f0(a, 0x7fffffff, 0x80000000)
f0(a, 10, 20)

f1(a, 0, 100)
f1(a, 0x7fffffff, 0x80000000)
f1(a, 10, 20)

f2(a, 0, 100)
f2(a, 0x7fffffff, 0x80000000)
f2(a, 10, 20)

f3(a, 0, 100)
f3(a, 0x7fffffff, 0x80000000)
f3(a, 10, 20)

f4(a, 0, 100)
f4(a, 0x7fffffff, 0x80000000)
f4(a, 10, 20)

f5(a, 0, 100)
f5(a, 0x7fffffff, 0x80000000)
f5(a, 10, 20)
