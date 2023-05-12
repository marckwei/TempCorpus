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

// MayHaveSideEffectOnNode() was a recursive function that could recurse enough times to cause
// an uncaught stack overflow. This was fixed by converting the recursive loop into an iterative
// loop.
//
// An example of a program that caused the stack overflow is:
//      eval("var a;a>(" + Array(2 ** 15).fill(0).join(",") + ");");
//
// MayHaveSideEffectOnNode() is originally called because the righthand side of the pNodeBin
// ">" may overwrite the lefthand side of ">". The righthand side of pNodeBin is a deep tree
// in which each pNode of the longest path is a pNodeBin(",").Since children of the original
// pNodeBin -> right are pNodeBins themselves, MayHaveSideEffectOnNode() must check all of
// their children as well.MayHaveSideEffectOnNode's original implementation was recursive and
// thus the stack would overflow while recursing through the path of pNodeBins.   

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "MayHaveSideEffectOnNode() should not cause a stack overflow nor should fail to \
terminate",
        body: function () {
            eval("var a;a>(" + Array(2 ** 15).fill(0).join(",") + ");");
            eval("var a;a===(" + Array(2 ** 15).fill(0).join(",") + ");");
        }
    }
]

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });