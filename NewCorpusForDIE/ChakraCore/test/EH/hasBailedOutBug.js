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

var shouldBailout = false;
function test0() {
  var obj0 = {};
  var func0 = function () {
  };
  var func1 = function () {
    (function () {
      'use strict';
      try {
        function func8() {
          obj0.prop2;
        }
        var uniqobj4 = func8();
      } catch (ex) {
        return 'somestring';
      } finally {
      }
      func0(ary.push(ary.unshift(Object.prototype.length = protoObj0)));
    }(shouldBailout ? (Object.defineProperty(Object.prototype, 'length', {
      get: function () {
      }
    })) : arguments));
  };
  var ary = Array();
  var protoObj0 = Object();
  ({
    prop7: shouldBailout ? (Object.defineProperty(obj0, 'prop2', {
      set: function () {
      }
    })) : Object
  });
  for (; func1(); ) {
  }
}
test0();
test0();
shouldBailout = true;
try {
  test0();
}
catch(ex) {
  print(ex);
}
