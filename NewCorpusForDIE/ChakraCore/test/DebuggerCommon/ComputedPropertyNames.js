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

function f() {
    return "f";
}

function g() {
    return "g";
}

// Step to var o statement, then step into each of the calls to f and g
// verifying that stepping into and out of calls contained in computed
// properties behaves correctly and the stack trace is sane.
// This case is at the global scope.
f; /**bp:resume('step_into');
     stack();resume('step_into');
     stack();resume('step_out');
     resume('step_into');

     stack();resume('step_into');
     stack();resume('step_out');

     stack();resume('step_into');
     stack();resume('step_out');

     stack();
     **/
var o = {
    [f()]: 1,
    [f() + g()]: 2
}

function test() {
    // Verify stepping and the stack again, as above, but in function scope.
    f; /**bp:resume('step_into');
         stack();resume('step_into');
         stack();resume('step_out');
         resume('step_into');

         stack();resume('step_into');
         stack();resume('step_out');

         stack();resume('step_into');
         stack();resume('step_out');

         stack();
         **/
    var o = {
        [f()]: 1,
        [f() + g()]: 2
    }
}

test();

WScript.Echo("passed");
