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

var e = 8;
function x() { throw 7; }
function y() {
    var i;
    for (i = 0; i < 10; i++) {
        try {
            if (i % 2 == 0) {
                try {
                    x();
                }
                catch (e) {
                    WScript.Echo("Inner catch: " + e);
                    if (i % 3) {
                        throw e;
                    }
                    if (i % 5) {
                        return e;
                    }
                }
                finally {
                    WScript.Echo("Finally: " + i);
                    continue;
                }
            }
        }
        catch (e) {
            WScript.Echo("Outer catch: " + e);
        }
        finally {
            WScript.Echo("Outer finally: " + i);
            if (++i % 9 == 0)
                return e;
        }
    }
}

WScript.Echo(y());