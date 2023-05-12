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

function Dump(output)
{
    if (this.WScript)
    {
        WScript.Echo(output);
    }
    else
    {
        alert(output);
    }
}

function throwException()
{
    try
    {
        BadType.someProperty = 0;
    }
    catch(e)
    {
        Dump(TrimStackTracePath(e.stack));
        Dump("");
    }
}

function throwExceptionWithFinally()
{
    try
    {
        BadTypeWithFinally.someProperty = 0;
    }
    catch(e)
    {
        Dump(TrimStackTracePath(e.stack));
        Dump("");
    }
    finally {} // Do nothing
}

function throwExceptionLineNumber()
{
    try
    {
        StricModeFunction();
    }
    catch(e)
    {
        Dump(TrimStackTracePath(e.stack));
    }
}

function StricModeFunction()
{
"use strict"
    this.nonExistentProperty = 1;
    
    if(1) {}
    
    WScript.Echo("foo");
}

function bar()
{
    throwException();
    throwExceptionWithFinally();
    throwExceptionLineNumber();
}

function foo()
{
    bar();
}

function runtest()
{
    foo();
}

if (this.WScript && this.WScript.Arguments && this.WScript.LoadScriptFile("../UnitTestFramework/TrimStackTracePath.js"))
{
    if (this.WScript.Arguments[0] == "runTest")
    {
        runtest();
    }
}
