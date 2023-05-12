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

var shouldBailout = false;

var failed = 0;
var valueCalls = 0;

function FAILED(x) {
    WScript.Echo("FAILED  #", x);
    failed++;
}

function test0() {
    var func2 = function () {
        return (g <= h);
    }
    var g = 1;
    var h = 1;
    obj.x = 1;
    if (shouldBailout) { h = { valueOf: function () { valueCalls++; return 3; } } }

    if ((func2(g))) {
    } else {
        FAILED(1);
    }
    return obj.x;
};

function test1() {
    var func2 = function () {
        return (g <= h);
    }
    var g = 1;
    var h = 1;
    obj.x = 1;
    if (shouldBailout) { h = { valueOf: function () { valueCalls++; return 3; } } }

    if ((!func2(g))) {
        FAILED(2);
    }
    return obj.x;
};
function test2() {
    var func2 = function () {
        return (g > h);
    }
    var g = 0;
    var h = 1;
    obj.x = 1;
    if (shouldBailout) { h = { valueOf: function () { valueCalls++; return 3; } } }

    if ((func2(g))) {
        FAILED(3);
    }
    return obj.x;
};

function test3() {
    var func2 = function () {
        return (g == h);
    }
    var g = 0;
    var h = 1;
    obj.x = 1;
    if (shouldBailout) { h = { valueOf: function () { valueCalls++; return 3; } } }

    if ((func2(g))) {
        FAILED(4);
    }
    return obj.x;
};
function test4() {
    var func2 = function () {
        return (g != h);
    }
    var g = 3;
    var h = 3;
    obj.x = 1;
    if (shouldBailout) { h = { valueOf: function () { valueCalls++; return 3; } } }

    if ((func2(g))) {
        FAILED(5);
    }
    return obj.x;
};


var obj = new Object();

obj.x = 1;

// generate profile
test0();
test1();
test2();
test3();
test4();

// run JITted code
test0();
test1();
test2();
test3();
test4();

// run code with bailouts enabled
shouldBailout = true;
test0();
test1();
test2();
test3();
test4();

if (valueCalls != 5)
{
    FAILED(6);
}

if (failed == 0) {
    WScript.Echo("Passed");
}