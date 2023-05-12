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

function throwExceptionWithCatch()
{
    try
    {
        throwException();
    }
    catch(e)
    {
        Dump(TrimStackTracePath(e.stack));
    }
}

var errorObject;
function throwException()
{
    errorObject = new Error("this is my error");
    throw errorObject;
}

function runtest(max, catchException)
{
    var helper = function(i)
    {
        return function(j)
        {
            if (j == 0)
            {
                return catchException == undefined ? throwExceptionWithCatch() : throwException();
            }
            that["function" + (j-1)](j-1);
        }
    }
    var that = new Object();
    var i = 0;
    for (i = 0; i < max; i++)
    {
        that["function" + i] = helper(i);
    }
    that["function" + (max-1)](max-1);
}

if (this.WScript && this.WScript.Arguments && this.WScript.LoadScriptFile("../UnitTestFramework/TrimStackTracePath.js"))
{
    if (this.WScript.Arguments[0] == "runTest")
    {
        runtest(this.WScript.Arguments[1]);
    }
}
