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
  var obj0 = {};
  var arrObj0 = {};
  var litObj0 = { prop1: 3.14159265358979 };
  var func1 = function (argMath1 = func0(), argMath3) {
    protoObj0.prop0 = ++this.prop0;
    this.prop0 = argMath3;
  };
  obj0.method0 = func1;
  obj0.method1 = obj0.method0;
  var IntArr0 = Array();
  var protoObj0 = Object.create(obj0);
  prop0 = 1;
  protoObj0.method0.call(litObj0, arrObj0);
  while (prop0) {
    protoObj0.method1(arrObj0);
    obj0.method0(obj0);
    prop0 = IntArr0.shift();
  }
  obj0.method0('');
}
test0();
test0();
test0();
WScript.Echo('pass');
