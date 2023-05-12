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

function test(s1, s2, b1)
{
    // Force float-pref
    s1 += 0.1;
    s2 += 0.1;
    b1 += 0.1;

    var r = false;

    // Test 1
    Count++;  r = false;
    if (s1 == b1) {
        r = true;
    }
    Check("s1 == b1", r, false);

    // Test 2
    Count++; r = false;
    if (s1 != b1)
    {
        r = true;
    }
    Check("s1 != b1", r, true);

    // Test 3
    Count++; r = false;
    if (s1 <= b1) {
        r = true;
    }
    Check("s1 <= b1", r, true);

    // Test 4
    Count++; r = false;
    if (s1 < b1) {
        r = true;
    }
    Check("s1 < b1", r, true);

    // Test 5
    Count++; r = false;
    if (s1 >= b1) {
        r = true;
    }
    Check("s1 >= b1", r, false);

    // Test 6
    Count++; r = false;
    if (s1 > b1) {
        r = true;
    }
    Check("s1 > b1", r, false);

    // Test 7
    Count++; r = false;
    if (s1 == s2)
    {
        r = true;
    }
    Check("s1 == s2", r, true);

    // Test 8
    Count++; r = false;
    if (s1 != s2) {
        r = true;
    }
    Check("s1 != s2", r, false);

    // Test 9
    Count++; r = false;
    if (s1 <= s2) {
        r = true;
    }
    Check("s1 <= s2", r, true);

    // Test 10
    Count++; r = false;
    if (s1 < s2) {
        r = true;
    }
    Check("s1 < s2", r, false);

    // Test 11
    Count++; r = false;
    if (s1 >= s2) {
        r = true;
    }
    Check("s1 >= s2", r, true);

    // Test 12
    Count++; r = false;
    if (s1 > s2) {
        r = true;
    }
    Check("s1 > s2", r, false);


    // Test 13
    Count++;
    Check("s1 == b1", s1 == b1, false);

    // Test 14
    Count++;
    Check("s1 != b1", s1 != b1, true);

    // Test 15
    Count++;
    Check("s1 <= b1", s1 <= b1, true);

    // Test 16
    Count++;
    Check("s1 < b1", s1 < b1, true);

    // Test 17
    Count++;
    Check("s1 >= b1", s1 >= b1, false);

    // Test 18
    Count++;
    Check("s1 > b1", s1 > b1, false);

    // Test 19
    Count++;
    Check("s1 == s2", s1 == s2, true);

    // Test 20
    Count++;
    Check("s1 != s2", s1 != s2, false);

    // Test 21
    Count++;
    Check("s1 <= s2", s1 <= s2, true);

    // Test 22
    Count++;
    Check("s1 < s2", s1 < s2, false);

    // Test 23
    Count++;
    Check("s1 >= s2", s1 >= s2, true);

    // Test 24
    Count++;
    Check("s1 > s2", s1 > s2, false);


    // Test 25
    Count++;  r = false;
    if (s1 === b1) {
        r = true;
    }
    Check("s1 === b1", r, false);

    // Test 26
    Count++; r = false;
    if (s1 !== b1)
    {
        r = true;
    }
    Check("s1 !== b1", r, true);

    // Test 27
    Count++; r = false;
    if (s1 === s2)
    {
        r = true;
    }
    Check("s1 === s2", r, true);

    // Test 28
    Count++; r = false;
    if (s1 !== s2) {
        r = true;
    }
    Check("s1 !== s2", r, false);

    // Test 29
    Count++;
    Check("s1 === b1", s1 === b1, false);

    // Test 30
    Count++;
    Check("s1 !== b1", s1 !== b1, true);

    // Test 31
    Count++;
    Check("s1 === s2", s1 === s2, true);

    // Test 32
    Count++;
    Check("s1 !== s2", s1 !== s2, false);



    if (!Failed)
    {
        print("Passed");
    }

}


test(1.1, 1.1, 2.1);
