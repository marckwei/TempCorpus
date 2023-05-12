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

// basic try/catch testcases, including functions

function print(x)
{
        WScript.Echo(x);
}

function f(n, str)
{
        try
        {
                if(n == 0)
                        throw str;
                else
                        f(n-1, str);
        }
        finally
        {
                print("f(" + n + "): " + str);
        }
}

try
{
        f(10, "test 1");
}
catch(a)
{
        print(a);
}

try {
    throw "Hello";
}
catch (e)
{
    with({}) { print(e); }
}

var d = {toISOString:1,toJSON:Date.prototype.toJSON};
try {
        d.toJSON()
}
catch(e)
{
    with({})
    {
        print(e);
    }
}

var a = "global";
try
{ 
  throw "abc";
}
catch(e)
{
  eval("var a = 'catch-local';")
}
print(a);

