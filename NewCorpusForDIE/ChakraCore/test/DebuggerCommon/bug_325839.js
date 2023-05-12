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

// Make sure that when we step out into jitted frame under debugger for "new" operator, 
// we bail out and continue debugging in interpreter mode.
// WinBlue 325839 is about the case when we missed putting debugger bailout for NewScObjectNoArg,
// as due to optimization this bytecode doesn't result into a (script) call.

function foo()
{
  WScript.Echo("foo"); /**bp:resume('step_out');stack();**/
}

function test_objectNoArg()
{
  new foo();
  var y = 1;	// We should bail out to here.
}

var oldArray = Array;
function MyArray()
{
  WScript.Echo("MyArray"); /**bp:resume('step_out');stack();**/
  return oldArray.apply(this, arguments);
}

function test_arrayNoArg()
{
  Array = MyArray;
  new Array();
  Array = oldArray;
  var y = 1;	// We should bail out to here.
}

test_objectNoArg();
test_arrayNoArg();
