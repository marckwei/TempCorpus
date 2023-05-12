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

//Arch: X86
//Flavor: chk

//reduced switches: -mic:1 -off:simplejit -off:memop
//noRepro switches1: -mic:1 -off:simplejit -off:memop -off:InterpreterProfile
//noRepro switches2: -mic:1 -off:simplejit -off:memop -off:DynamicProfile
//noRepro switches3: -mic:1 -off:simplejit -off:memop -off:EliminateArrayAccessHelperCall
//noRepro switches4: -mic:1 -off:simplejit -off:memop -off:JsArraySegmentHoist
//noRepro switches5: -mic:1 -off:simplejit -off:memop -off:ArraySegmentHoist
//noRepro switches6: -mic:1 -off:simplejit -off:memop -off:ArrayCheckHoist
//noRepro switches7: -mic:1 -off:simplejit -off:memop -off:AggressiveIntTypeSpec
//noRepro switches8: -mic:1 -off:simplejit -off:memop -off:TypeSpec
//noRepro switches9: -mic:1 -off:simplejit -off:memop -off:BoundCheckHoist
//noRepro switches10: -mic:1 -off:simplejit -off:memop -off:BoundCheckElimination
//noRepro switches11: -mic:1 -off:simplejit -off:memop -off:TrackRelativeIntBounds
//noRepro switches12: -mic:1 -off:simplejit -off:memop -off:PathDependentValues
var int = true;
function test() {
  var start = int ? 1 : -5;
  var end = start + 8;
  for (var i = start; i < end; i++) {
    a[i] = 3;
  }
  int = false;
}
var a = Array(10);
a.fill();
test();
test();
a[0];

print("PASSED");

// === Output ===
// command: ch.exe -mic:1 -off:simplejit -off:memop bug4587739.js
// exitcode: C0000420
// stdout:
//
// stderr:
// ASSERTION 14340: (lib\runtime\language\profilinghelpers.cpp, line 136) head->left == 0
//  Failure: (head->left == 0)
// FATAL ERROR: ch.exe failed due to exception code c0000420
