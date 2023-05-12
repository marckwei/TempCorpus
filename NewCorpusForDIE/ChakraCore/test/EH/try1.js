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

// basic try/catch testcases

function verify(x,y)
{
    if(x != y)
        WScript.Echo("ERROR: " + x + " != " + y);
}

var objs = [5, undefined, 'c', "test", [1,2,3] ];

for(var i = 0; i < objs.length; ++i)
{
    // test #1: basic try/catch
    try
    {
        throw objs[i];
    }
    catch(a)
    {
        WScript.Echo("caught " + a);
        verify(a, objs[i]);
    }

    // test #2: try/finally within a try/catch/finally
    try
    {
        try
        {
            throw objs[i];
        }
        finally
        {
            WScript.Echo("inner finally, i = " + i);
        }
    }
    catch(a)
    {
        WScript.Echo("caught " + a);
        verify(a, objs[i]);
    }
    finally
    {
        WScript.Echo("outer finally, i = " + i);
    }

    // test #3: more deeply nested try/catch/finally
    try
    {
        try
        {
            try
            {
                throw objs[i];
            }
            finally
            {
                WScript.Echo("finally #3, i = " + i);
            }
        }
        catch(a)
        {
            WScript.Echo("caught " + a);
            verify(a, objs[i]);
        }
        finally
        {
            WScript.Echo("finally #2, i = " + i);
            throw "another throw";
        }
    }
    catch(a)
    {
        WScript.Echo("caught " + a);
        verify(a, "another throw");
    }
}
