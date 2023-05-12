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

// Test our sort implementation.
function testArray(SORT_FNC, limit, test_id) {
    var THROW = function (pos) {
        throw new Error("Broken sort!!! (" + pos + ") for test:" + test_id);
    };

    function getArray(is_typed) {
        var t = is_typed ? new Int32Array(limit) : new Array(limit);

        for (var i = limit - 1; i >= 0; i--) {
            t[i] = i;
        }

        return t.sort(SORT_FNC);
    }

    // test array of 1s
    var arr = new Array(limit);
    arr.fill(1);
    arr = arr.sort(SORT_FNC);
    if (arr[0] + arr[limit - 1] != 2) THROW(0); // 0

    // what if we add couple of other numbers?
    arr[0] = 5;
    arr[limit - 1] = 0;
    arr = arr.sort(SORT_FNC);
    if (arr[0] + arr[limit - 1] != 5) THROW(1); // 1

    // test reverse ordered JS Array
    arr = getArray(0);
    if (arr[0] + arr[1] + arr[limit - 1] != limit) THROW(2); // 2

    // test reverse ordered JS TypedArray
    arr = getArray(1);
    if (arr[0] + arr[1] + arr[limit - 1] != limit) THROW(3); // 3

    // scramble
    for (var i = 1; i < limit / 10; i++) {
        var tmp = arr[limit - i];
        arr[limit - i] = arr[i];
        arr[i] = tmp;
    }

    // test mixed ordered JS TypedArray
    arr = arr.sort(SORT_FNC);
    if (arr[0] + arr[1] + arr[limit - 1] != limit) THROW(4); // 4

    // scramble further
    for (var i = 1; i < limit / 10; i++) {
        var tmp = arr[limit - i];
        arr[limit - i] = arr[i];
        arr[i] = tmp;
    }

    var pos = limit - 1;
    for (var i = limit / 2; i < limit; i++) {
        var tmp = arr[pos];
        arr[pos] = arr[i];
        arr[i] = tmp;
        pos--;
    }

    // test scrambled JS TypedArray
    arr = arr.sort(SORT_FNC);
    if (arr[0] + arr[1] + arr[limit - 1] != limit) THROW(5); // 5
}

var arraySize = WScript.Platform.BUILD_TYPE == "Release" ? 5e5 /* 500K */ : 1e4; // CI timeout for Debug build

if (arraySize % 2 || arraySize < 1e4) {
    throw new Error(
        "Array size is too small.. and some of the loops above works better with arraySize % 2 == 0")
}

testArray(
    function (x, y) {
        return x > y ? +1 : (x < y ? -1 : 0);
    },
    arraySize /* test 500K items */,
    "NoThrow");

testArray(
    function (x, y) {
        try {
            if (x % 2) throw new Error("Crash!!!! ?");
        } catch (e) { /* no. this shouldn't crash! */ }

        return x > y ? +1 : (x < y ? -1 : 0);
    },
    1000 /* no need to test bigger arrays. >= 512 is sufficient */,
    "Throw-Catch Inside");

// This one actually doesn't sort anything.
try {
    testArray(
        function (x, y) {
            if (x % 2) throw new Error("Crash!!!! ?");

            return x > y ? +1 : (x < y ? -1 : 0);
        },
        1000 /* no need to test bigger arrays.*/,
        "Throw-Catch Outside");
} catch (e) { /* no. this shouldn't crash! */ }

WScript.Echo("PASS");
