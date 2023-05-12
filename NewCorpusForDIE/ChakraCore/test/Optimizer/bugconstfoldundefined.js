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

var obj1 = {};
var litObj1 = {};
var func1 = function () {
  if (ary.push(arguments[0])) {
  }
};
obj1.method0 = func1;
var ary = Array();
var FloatArr0 = [
  6333966881283110000,
  1
];
var VarArr0 = Array();
var v3 = 0;
function v4() {
  return caller1_bar();
}
function v5() {
  return v4();
}
function caller1_bar() {
  v3++;
  if (v3 < 10) {
    v4();
    var id33 = {} instanceof Boolean;
  }
  if (ary.shift(), (obj1.method0.call(litObj1, FloatArr0), id33 <= id33 ? VarArr0 : FloatArr0.reverse())) {
  }
}
v5();
WScript.Echo(ary.slice().reduce(function () {
}));

