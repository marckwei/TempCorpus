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
var G = 0;

function test0(){
  var obj0 = {};
  var obj1 = {};
  var func1 = function(){
    var __loopvar2 = 0;
    while(__loopvar2 < 3) {
        __loopvar2++;
      while(a < (1)) {
        break ;
      }
      var a = 1;
      (shouldBailout ? (a = { valueOf: function () { G += 1; return 3; } }, 1) : 1);
    }
  }
  var func2 = function(){
  }
  obj0.method0 = func2;
  var i16 = new Int16Array(256);
  var ui8 = new Uint8Array(256);
  var a = 1;
  var c = 1;
  var d = 1;
  var e = 1;
  //Snippet 1: basic inlining test
  obj0.prop0 = (function(x,y,z) {
    obj1.prop0 = func1();

    return obj0.method0();
  })((c *= (shouldBailout ? (a = { valueOf: function() { G += 10; return 3; } }, ui8[((obj1.length, 2, 2.7970894295654E+18)) & 255]) : ui8[((obj1.length, 2, 2.7970894295654E+18)) & 255])),(d >>>= i16[((shouldBailout ? (a = { valueOf: function() { G += 100; return 3; } }, (! 2)) : (! 2))) & 255]),((~ 0) ^ a));
  
};

// generate profile
test0();

// run JITted code
test0();

// run code with bailouts enabled
shouldBailout = true;
test0();


if (G == 102)
{
    WScript.Echo("Passed");
}
else
{
    WScript.Echo("FAILED");
}
