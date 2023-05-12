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
var obj0 = {};
var protoObj0 = {};
var arrObj0 = {};
var VarArr0 = Array(obj0, 1);
for (var _strvar72 of VarArr0) {
  function func12() {
    arrObj0.prop6 = protoObj0.prop4 || arrObj0.prop3 ? -261907305 ? -1797282093 : _strvar72 : _strvar72;
  }
  var uniqobj2 = func12();
  var uniqobj3 = func12();
}
WScript.Echo(arrObj0.prop6 + "\n");

var obj0 = {};
var VarArr0 = Array();
VarArr0[2] = 2147483650;
var __loopvar0 = 11;
do {
  __loopvar0--;
  if (__loopvar0 <= 3) {
    break;
  }
  obj0.prop0 += VarArr0;
  var __loopvar1 = 3;
  do {
    __loopvar1++;
  } while (VarArr0 && __loopvar1 != 11);
} while (-2147483647);
WScript.Echo(obj0.prop0);
