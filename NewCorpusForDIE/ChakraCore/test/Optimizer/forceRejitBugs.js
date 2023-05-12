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

function foo(i1)
{
  var d2 = 16777217;
  return (!i1 >>> ((d2 % ~~295147905179352830000) + 4268133759)) | 0;  
}
print(foo());
print(foo());
print(foo());

function test0() {
}
var arrObj0 = {};
var func2 = function () {
  Object;
  function v0() {
    for (var v1 = 0; v1 < 8; v1++) {
      function func9() {
        Object.prototype;
      }
      obj7 = func9();
    }
  }
  v0();
};

var ary = Array(2);
var VarArr0 = [];
var __loopvar0 = 4;
func2()
func2()

for (var _strvar65 of ary) {
  prop5 = test0;
  litObj9 = { prop7: VarArr0.unshift(func2(), func2()) };
}