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
  var func1 = function (argMath4, argMath6 = false ? (Object.defineProperty(protoObj1, 'prop0', {
    set: function (_x) {
      protoObj1.prop4 = protoObj0.prop0 < protoObj0.prop0 || argMath4 > argMath4;
    },
    configurable: true
  }), arrObj0[((false ? arrObj0[(-493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object) >= 0 ? -493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object) : 0) & 15] = 'x' : undefined, -493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object)) >= 0 ? -493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object) : 0) & 15]) : arrObj0[((false ? arrObj0[(-493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object) >= 0 ? -493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object) : 0) & 15] = 'x' : undefined, -493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object)) >= 0 ? -493942660.9 instanceof (typeof EvalError == 'function' ? EvalError : Object) : 0) & 15]) {
    while (argMath6 >> (uic8[129])) {
      if (!(argMath6 = argMath4)) {
      }
    }
  };
  var func2 = function () {
    return func1();
  };
  var func3 = function () {
    func2();
  };
  var func4 = function () {
    func2();
    return func2();
  };
  obj0.method0 = func3;
  var uic8 = new Uint8ClampedArray();
  arrObj0[0] = -1148316534.9;
  var protoObj0 = Object(obj0);
  func4();
  protoObj0.method0();
}
test0();
print("PASSED");