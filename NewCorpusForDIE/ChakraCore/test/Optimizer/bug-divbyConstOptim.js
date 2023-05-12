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
// Copyright (C) Microsoft Corporation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------
fail = false;
// #1
function test0() {
  function leaf() {
    return 100;
  }
  var obj1 = {};
  var func0 = function () {
    return leaf();
  };
  var func2 = function () {
    if (!(func0.call() % -2147483646)) {
      arrObj0;
    }
  };
  obj1.method1 = func2;
  obj1.method1();
}
test0();
test0();
test0();
test0();


// #2
function foo(a, b)
{
  a %= 3;
  b = b >>a;
  return b;
}

base1 = foo(4,2);
foo(4,2);
foo(4,2);
foo(4,2);
foo(4,2);

case1 = foo(4,2);
if(base1 != case1)
{
  print("ERROR: Functional error in jit - Case1");
  fail = true;
}

// #3
function foo1(a)
{
  a %= 94;
  a = a & 255;
  return a;
}

base2 = foo1(123);
foo1(123);
foo1(123);
foo1(123);
foo1(123);
foo1(123);

case2 = foo1(123);

if(base2 != case2)
{
  print("ERROR: Functional error in jit - Case2");
  fail = true;
}
if(!fail)
  print('PASS'); //Test failure causes assertion /error
