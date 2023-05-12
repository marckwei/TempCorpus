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
    var protoObj0 = {};
    var obj1 = {};
    var func0 = function () {
        (function () {
        }(c++));
    };
    var func2 = function () {
    };
    var func4 = function () {
    };
    obj0.method0 = func0;
    obj0.method1 = func4;
    obj1.method0 = func2;
    obj1.method1 = obj0.method0;
    var a = -647661593;
    var c = 1650427918.1;
    Object.create(obj1);
    arrObj0 = obj1;
    var __loopvar0 = 7 + 9;
    while (a) {
        __loopvar0 -= 3;
        if (__loopvar0 == 7) {
            break;
        }
        function __callback1(__bar) {
            obj1.method0 = protoObj0;
            __bar();
        }
        function __callback2() {
            var uniqobj7 = {
                nd1: {
                    nd0: {
                        lf0: { method1: arrObj0.method1 },
                        lf1: { method0: obj0.method1 },
                        nd2: { lf0: { method0: arrObj0.method0 } }
                    }
                }
            };
            var id40 = arrObj0.method1();
        }
        __callback1(__callback2);
    }
    if (c !== 1650427920.1) {
        WScript.Echo('fail: c === ' + c);
    }
}
test0();
test0();

WScript.Echo('pass');