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


function IsNegZero(x)
{
    return x===0 && (1/x)===-Infinity;
}

function print(x)
{
    WScript.Echo(IsNegZero(x)? "-0" : x);
}

// Test int dev specialization and bailout
function test1()
{
    print( g / 5);
}
    
var g = 5;

test1(); // collect profile
test1(); // optimized
g = 1;
test1(); // bailout on not int result
g = -0;
test1(); // bailout on FromVar of -0


// Test bailout when div is hoisted
function test2()
{
    for (var i = 0; i < g / 5; i++)
    {
    }
    print(i);
}

g = 5;
test2(); // collect profile
test2(); // optimized
g = 10;
test2();
g = 11;
test2(); // bailout on not int result (at loop top)
g = -0;
test2(); // bailout on FromVar of -0 (at loop top)


// Test bailout on negative 0 result
function test3()
{
    var v = g / 4;
    print(v / d);
}

var d = -4;
g = 16;
test3(); // collect profile
test3(); // optimized
g = 0;
test3(); // bail on negative 0 result
g = 16;
d = 0;
test3();

g = 15; 
d = 3;
test3();

g = -12;
test3();


