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
  var protoObj0 = {};
  var obj1 = {};
  var func0 = function () {
  };
  var func4 = function () {
    return func4.caller;
  };
  obj0.method1 = func0;
  obj1.method0 = func4;
  Object.prototype.method0 = obj0.method1;
  var ary = Array();
  ary[0] = 41697303.1;
  var protoObj1 = Object(obj1);
  for (var _strvar35 in ary) {
    function v18() {
      for (var v21 = 0; v21 < 3; v21++) {
        (function () {
          var uniqobj8 = [
            protoObj1,
            protoObj0
          ];
          uniqobj8[__counter % uniqobj8.length].method0();
        }());
      }
    }
    v18();
  }
}
test0();
test0();
WScript.Echo("Passed");
