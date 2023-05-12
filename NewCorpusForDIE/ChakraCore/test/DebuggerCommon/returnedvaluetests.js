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

// Validating basic functionality of return value on the step-over.

var value = 10;
var o = {
    get b() { return value; },
    set b(val) { value = val; }
}

function sum(a, b) {
    return a+b;
}
function mul(a, b) {
    return a*b;
}

function test1() {
    var k = 10;                /**bp:locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();**/
    k = sum(1,2) + sum(4,5);
    k = mul(4,5);
    k = mul(sum(3,2),sum(6,5));
    return k;
}
test1();

function test2() {
    var m = 10;                /**bp:locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();**/
    m = o.b;
    o.b = 31;
    m = sum(o.b, o.b);
}
test2();

function f1() {
    return function () {
        return function () {
            return "inside";
        }
    }
}

function f2() {
    function f3() {
        return 20;
    }
    return 31 + f3();
}

function test3() {
    var j = 10;                /**bp:locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();**/
    var j1 = f2();
    j1 = f1();
    f1()();
    f1()()();
}
test3();

WScript.Echo("Pass");