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

// let and const variables should exhibit redeclaration and assignment to const errors
// even when they are located in an ActivationObjectEx cached scope.
// Test them independently
//
function f0() {
    let x = 0;

    try {
        eval("var x = 5");
    } catch (e) {
        WScript.Echo("eval('var x = 5') threw '" + e.message + "'");
    }

    try {
        eval("x = 5");
    } catch (e) {
        WScript.Echo("unexpected error thrown: '" + e.message + "'");
    }

    WScript.Echo("x: " + x);
}

// Called-in-loop is no longer the heuristic we want to use to enable scope caching.
// Instead rely on -force:cachedscope and call the test function only once here.
f0();

function f1() {
    const y = 1;

    try {
        eval("var y = 5");
    } catch (e) {
        WScript.Echo("eval('var y = 5') threw '" + e.message + "'");
    }

    try {
        eval("y = 5");
    } catch (e) {
        WScript.Echo("eval('y = 5') threw '" + e.message + "'");
    }

    WScript.Echo("y: " + y);
}

// Called-in-loop is no longer the heuristic we want to use to enable scope caching.
// Instead rely on -force:cachedscope and call the test function only once here.
f1();
