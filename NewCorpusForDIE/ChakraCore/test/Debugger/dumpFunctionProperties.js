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

function foo() {
  var x = 1; /**bp:dumpFunctionProperties();**/
}
foo();

(function () {
  var x = 1; /**bp:dumpFunctionProperties(0, 1);**/
})();

var arr = [0];
arr.forEach((s) => {
  var x = 1; /**bp:dumpFunctionProperties([0], '0');**/
});

function same(shouldBreak) {
  if (shouldBreak) {
    // 0 is same(true), 1 is same(false), 2 is global function). same is dumped only once as functionHandle for frame 0 and 1 is same.
    var x = 1; /**bp:stack();dumpFunctionProperties([0,1,2]);**/
  } else {
    same(!shouldBreak);
  }
}
same(false);

function one(arg1) {
  two();
}
function two(arg1, arg2) {
  three();
}
function three(arg1, arg2, arg3) {
  var x = 1; /**bp:stack();dumpFunctionProperties([0,1,2,3], 0);**/
}
one();

WScript.Echo("pass");
