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

// Tests that getOwnPropertyDescriptor is not supported in IE8-mode for non-DOM objects.

function TestGetOwnPropertyDescriptor(obj, property) {
    CatchAndWriteExceptions(function () {
        var desc = Object.getOwnPropertyDescriptor(obj, property);
        var exists = (desc != undefined);
        WScript.Echo("Found descriptor for " + property + ": " + exists);
        if (exists) {
            for (var i in desc) {
                WScript.Echo(i + "=" + desc[i]);
            }
        }
    });
}

function CatchAndWriteExceptions(func) {
    try {
        func();
    }
    catch (e) {
        WScript.Echo(e.name + ": " + e.number);
    }
}

TestGetOwnPropertyDescriptor({ foo: "fooValue" }, "foo");
