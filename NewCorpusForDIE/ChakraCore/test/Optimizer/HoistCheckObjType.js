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

var GiantPrintArray = [];
function makeArrayLength() {
}
var obj0 = {};
var obj1 = {};
var arrObj0 = {};
var func3 = function () {
  protoObj0._x = {};
  for (var v0 = 0; v0 < 3; v0++) {
    delete arrObj0.length;
    protoObj0.length = protoObj0._x;
  }
  GiantPrintArray.push(arrObj0.length);
};
obj0.method1 = func3;
obj1.method0 = obj0.method1;
obj1.method1 = obj1.method0;
arrObj0.length = makeArrayLength();
protoObj0 = arrObj0;
for (var _strvar13 in obj1) {
  obj0.method1();
}
var uniqobj3 = [obj1];
uniqobj3[0].method1();
WScript.Echo(GiantPrintArray);
