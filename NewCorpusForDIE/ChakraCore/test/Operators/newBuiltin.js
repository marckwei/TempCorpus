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
// Test 0 - check stuff
//-------------------------------------------------------------

function test0()
{
    assert(eval.prototype == undefined);
}

//-------------------------------------------------
// Test 1 - throw, new built in function eval()
//-------------------------------------------------
function test1()
{
    new eval();
}

runtest("test0", test0, false);
runtest("test1", test1, true);

if (failed == 0)
{
    WScript.Echo("Passed");
}
