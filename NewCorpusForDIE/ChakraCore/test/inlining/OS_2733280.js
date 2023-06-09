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
  function leaf() {
  }
  var obj0 = {};
  var obj1 = {};
  var func3 = function (...args) {
  };
  var func4 = function () {
    arguments;
  };
  obj0.method0 = func3;
  obj0.method00 = func4;
  protoObj0 = Object(obj0);
  var v0 = {
      v1: function () {
        return function bar() {
          delete protoObj0.prop0;
          this.method0.apply(obj1, arguments);
          this.method00.apply(obj1, arguments);
        };
      }
    };
  obj0.method1 = v0.v1();
  var uniqobj4 = [obj0];
  var uniqobj5 = uniqobj4[0];
  uniqobj5.method0((protoObj0.method1(leaf)));
}
test0();
test0();
test0();
WScript.Echo("PASS");