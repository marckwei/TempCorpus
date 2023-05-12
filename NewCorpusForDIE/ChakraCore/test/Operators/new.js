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

var failed = 0;
function runtest(name, func, throwException)
{
    try
    {
        func();
        if (throwException)
        {
            WScript.Echo(name + ": Test failed, unexpected no exception thrown");
            failed++;
        }
        else
        {
            WScript.Echo(name + ": Test passed, expected no exception thrown");
        }
    }
    catch (e)
    {
        if (!throwException || (e.name != "TypeError" && e.name != "ReferenceError"))
        {
            WScript.Echo(name + ": test failed, unexpected " + e.name + "-" + e.message);
            failed++;
        }
        else
        {
            WScript.Echo(name + ": Test passed, expected " + e.name + "-" + e.message);
        }
    }
}

function assert(cond)
{
    if (!cond)
    {
        throw new Error("AssertFailed");
    }
}

//-------------------------------------------------------------
// Test 1 - throw, new integer value
//-------------------------------------------------------------

function test1()
{
    var i = 1;
    new i;
}

//-------------------------------------------------------------
// Test 2 - throw, new null constant
//-------------------------------------------------------------

function test2()
{
    new null();
}
//-------------------------------------------------------------
// Test 3 - throw, new int constant
//-------------------------------------------------------------

function test3()
{
    new 1();
}
//-------------------------------------------------------------
// Test 4 - success, plain old new Object()
//-------------------------------------------------------------
function test4()
{
    var o = new Object();
}
//-------------------------------------------------------------
// Test 5 - throw, new object reference
//-------------------------------------------------------------
function test5()
{
    var o = new Object();
    new o;
}
//-------------------------------------------------------------
// Test 6 - throw, new undefined "Blah"
//-------------------------------------------------------------
function test6()
{
    new Blah();
}
//-------------------------------------------------------------
// Test 7 - throw, new object reference
//-------------------------------------------------------------
function test7()
{
    var o = new Object();
    new o;
}
//-------------------------------------------------------------
// Test 8 - success, new function with prototype and field init
//-------------------------------------------------------------
function ClassProto()
{
    this.hello = "yay"
}

ClassProto.prototype.func = function()
{
    return 3;
}

function test8()
{
    var o = new ClassProto();
    assert(o.constructor == ClassProto);
    assert(o.hello == "yay");
    assert(o.func() == 3);
}
//-------------------------------------------------
// Test 9 - success, new plain function without prototype
//-------------------------------------------------
function PlainFunction()
{
    this.hello = "yay2";
}
function test9()
{
    var o = new PlainFunction();
    assert(o.constructor == PlainFunction);
    assert(o.hello == "yay2");
}

runtest("test1", test1, true);
runtest("test2", test2, true);
runtest("test3", test3, true);
runtest("test4", test4, false);
runtest("test5", test5, true);
runtest("test6", test6, true);
runtest("test7", test7, true);
runtest("test8", test8, false);
runtest("test9", test9, false);
if (failed == 0)
{
    WScript.Echo("Passed");
}
