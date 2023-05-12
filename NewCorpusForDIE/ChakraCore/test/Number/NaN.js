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

function print(s) {
    if (typeof(WScript) == "undefined")
        document.write(s + "<br/>");
    else
        WScript.Echo(s);
}

var Count = 0;
var Failed = 0;

function Check(str, result, expected)
{
    if (result != expected)
    {
        print("Test #"+Count+" failed. <"+str+"> Expected "+expected);
        Failed++;
    }
}

function test()
{
    var x = NaN + 0.5;
    var r = false;

    // Test 1
    Count++; r = false;
    if (x == x) {
        r = true;
    }
    Check("x == x", r, false);

    // Test 2
    Count++; r = false;
    if (x != x) {
        r = true;
    }
    Check("x != x", r, true);

    // Test 3
    Count++; r = false;
    if (x <= x) {
        r = true;
    }
    Check("x <= x", r, false);

    // Test 4
    Count++; r = false;
    if (x < x) {
        r = true;
    }
    Check("x < x", r, false);

    // Test 5
    Count++; r = false;
    if (x >= x) {
        r = true;
    }
    Check("x >= x", r, false);

    // Test 6
    Count++; r = false;
    if (x > x) {
        r = true;
    }
    Check("x > x", r, false);

    // Test 7
    Count++;
    Check("x == x", x == x, false);

    // Test 8
    Count++;
    Check("x != x", x != x, true);

    // Test 9
    Count++;
    Check("x <= x", x <= x, false);

    // Test 10
    Count++;
    Check("x < x", x < x, false);

    // Test 11
    Count++;
    Check("x >= x", x >= x, false);

    // Test 12
    Count++;
    Check("x > x", x > x, false);

    // Test 13
    Count++; r = false;
    if (x === x) {
        r = true;
    }
    Check("x === x", r, false);

    // Test 14
    Count++; r = false;
    if (x !== x) {
        r = true;
    }
    Check("x !== x", r, true);


    if (!Failed)
    {
        print("Passed");
    }
}


test();
