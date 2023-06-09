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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var arr = [], arr2 = [];

let setCount = 0;
let getCount = 0;

function check(actual, expected)
{
    if (actual !== expected)
    {
        throw new Error("Wrong value actual: " + actual + " expected: " + expected);
    }
}

// Test push traps with int based accessors on prototype
Object.defineProperty(Array.prototype, '0', {
    get: function() {
        ++getCount;
        return 30;
    },
    set: function() {
        ++setCount;
        return 60;
    },
    configurable: true
});

arr.push(1);
check(arr.length, 1);
check(setCount, 1);
check(getCount, 0);
check(JSON.stringify(arr), '[30]')
check(setCount, 1);
check(getCount, 1);
check(arr[0], 30);
check(getCount, 2);
check(arr2[0], 30);
check(arr2.length, 0);

// Test push traps with float based accessors on prototype
Object.defineProperty(Array.prototype, '0', {
    get: function() {
        ++getCount;
        return 30.5;
    },
    set: function() {
        ++setCount;
        return 60.3;
    },
    configurable: true
});

arr.push(1);
arr2.push(0.5);
check(arr.length, 2);
check(arr2.length, 1);
check(setCount, 2);
check(getCount, 3);
check(JSON.stringify(arr), '[30.5,1]');
check(JSON.stringify(arr2), '[30.5]');
check(setCount, 2);
check(getCount, 5);
check(arr[0], 30.5);
check(arr[1], 1);
check(arr2[0], 30.5);
check(getCount, 7);

print("pass");
