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

var __counter = 0;
function test0() {
  __counter++;
  function leaf() {
  }
  var obj0 = {};
  var obj1 = {};
  var arrObj0 = {};
  var func0 = function () {
    for (var _strvar0 in obj0) {
      if (_strvar0.indexOf('method') != -1) {
        continue;
      }
      return leaf();
    }
    return leaf();
    do {
    } while (arrObj0);
  };
  var func2 = function () {
  };
  obj0.method0 = func2;
  obj0.method1 = func0;
  arrObj0.method1 = func2;
  Object.prototype.prop0 = -21449704;
  var uniqobj27 = [
      obj1,
      obj0,
      arrObj0
    ];
  var uniqobj28 = uniqobj27[__counter];
  uniqobj28.method1();
}
try
{
    test0();
    test0();
    test0();
}
catch(e)
{
    WScript.Echo("PASS");
}
