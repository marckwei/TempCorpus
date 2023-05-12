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

function test0() {
  var GiantPrintArray = [];
  var obj0 = {};
  var IntArr0 = [];
  var IntArr1 = [];
  var VarArr0 = [obj0];
  var e = -649211448;
  var f = 137044716;
  var protoObj1 = Object();
  function v0(v1) {
    var v4 = {};
    v4.a = v1;
    v4.a[1] = null;
  }
  GiantPrintArray.push(v0(IntArr0));
  for (var _strvar26 in VarArr0) {
    for (; IntArr1.push(); f++) {
    }
    for (var _strvar0 in IntArr0) {
      f = (e > _strvar0 & 255);
    }
  }
  protoObj1.prop5 = { prop3: !f };
  return protoObj1.prop5.prop3;
}

var x = test0();
x &= test0();
x &= test0();

if (x == true) {
  WScript.Echo("PASSED");
}
else {
  WScript.Echo("FAILED");
}
