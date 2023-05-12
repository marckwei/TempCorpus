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
  var obj0 = {};
  var arrObj0 = {};
  var func0 = function () {
  };
  var func1 = function () {
  };
  var func2 = function () {
    for (; func1(ui16[218361093] >= 0 ? ui16[218361093] : 0); func1((false ? arrObj0 : undefined))) {
    }
  };
  obj0.method1 = func0;
  arrObj0.method1 = func2;
  var ui16 = new Uint16Array();
  var uniqobj1 = [
    obj0,
    arrObj0
  ];
  var uniqobj2 = uniqobj1[__counter % uniqobj1.length];
  uniqobj2.method1();
  for (var _strvar5 of ui16) {
  }
}
test0();
test0();
test0();
WScript.Echo("Passed");
