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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function confirmThrows(call, errorType)
{
  var success = false;
  try {
    call();
  } catch (e) {
    if (e instanceof errorType) {
      success = true;
    }
  }
  if (!success) {
    throw new Error ("Test was meant to throw " + errorType + "but it didn't")
  }
}

function test0() {
    var GiantPrintArray = [];
    var obj1 = {};
    function v9870() {
      var arr = [];
      var v9872 = [];
      Object.defineProperty(Array.prototype, "0", { configurable: true, get: function () { return 30; } });
      GiantPrintArray.push(v9872.indexOf(30));
    }
    confirmThrows(v9870, TypeError);
    if (GiantPrintArray[0] !== 30) {
      throw new Error('Wrong value set');
    }
};
test0();
test0();

function test1() {
  var arr = [];
  Object.preventExtensions(arr);
  arr.push(0);
}
confirmThrows(test1, TypeError);
confirmThrows(test1, TypeError);

Object.defineProperty(Object.prototype,"a",{get:function(){return 8 }});

function test2() {
  var GiantPrintArray = [];
  var obj1 = {};
  var func1 = function(){
    GiantPrintArray.push(obj1.a);
  }

  confirmThrows(func1, TypeError);

  function v31079()
  {
    Object.defineProperty(Array.prototype, "4", {configurable : true, get: function(){return 15;}});
    GiantPrintArray.push(1);
    GiantPrintArray.push(1);
  }

  confirmThrows(v31079, TypeError);
  confirmThrows(v31079, TypeError);

  if (GiantPrintArray.length > 0) {
    throw new Error ("Length should be 0");
  }
}
test2();
test2();

print("pass");
