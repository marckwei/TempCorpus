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

// OS: Bug 620694: Assertion when evaluating 'new Map();' in F12
//
//     Object.toString() incorrectly returns Var from temporary allocator.
//
// Run with: -es6all  (To make it more likely to repro, add -recyclerstress)
//

/// <reference path="../UnitTestFramework/UnitTestFramework.js" />
WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");


// Bug: "x" is from temp allocator. Supposed to contain string "[object Map]".
var x = (new Map()).toString();

// Try to overwrite memory of "x" with other similar Vars also from temp allocator, "[object Set]".
for (var i = 0; i < 10; i++) {
    var tmp = new Set();
    tmp = tmp.toString();
}

assert.areEqual("[object Map]", x);
WScript.Echo("pass");
