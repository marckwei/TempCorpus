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
  var GiantPrintArray = [];
  var obj1 = {};
  var func1 = function () {
    var v0 = true;
    var v1 = function v2() {
      if (v0) {
        v0 = false;
        v2();
      }
      protoObj0.prop0 = i16;
      test0;
    };
    v1();
    function v5(v6) {
      var v9 = {};
      v9.a = v6;
      v9.a[1] = null;
    }
    GiantPrintArray.push(v5(ary));
    return shouldBailout ? (Object.defineProperty(protoObj0, 'prop0', {
      set: function () {
      }
    })) : Error();
  };
  var func2 = function () {
    for (var _strvar4 of ary) {
      Math.tan((func1()));
    }
  };
  var func3 = function () {
    func2(func2(func1()));
    func1();
  };
  obj1.method1 = func1;
  var ary = Array();
  var i16 = new Int16Array();
  var protoObj0 = Object();
  if (!(obj1.method1() + (func3()))) {
  }
  func1();
}
test0();
shouldBailout = true;
test0();
print("Passed");