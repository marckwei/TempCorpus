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
    var func3 = function () {
        return -819563736;
    };
    var IntArr1 = Array();
    var e = 65535;
    IntArr1[7] = -1073741824;
    var __loopvar0 = 11;
    while (func3()) {
        __loopvar0--;
        if (__loopvar0 === 11 - 4) {
            break;
        }
        while (IntArr1.reverse()) {
            break;
        }
    }
    if (!e) {
        for (var _strvar0 of f64) {
          if (_strvar0.indexOf()) {
        }
    eval('');
}
}
for (var _strvar30 of IntArr1) {
}
}
test0();
test0();

function test1() {
  var protoObj0 = {};
  var func2 = function (argObj1, argObj2) {
    argObj2.prop0;
    for (var __loopvar3 = 6;;) {
      if (__loopvar3) {
        break;
      }
      __loopvar3--;
      if (-6661195820409580000) {
        GiantPrintArray.push('c = ' + (c | 0));
        func1.call(argObj1);
        argObj2.prop0 = ary[-406953050 ? -406953050 : 0];
      } else {
        argObj1 = argObj2;
        protoObj0;
      }
    }
  };
  var ary = Array();
  func2(protoObj0, protoObj0);
}
test1();
test1();
test1();
test1();

WScript.Echo('pass');