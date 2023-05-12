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
    var arrObj0 = {};
    var func1 = function () {
        (function () {
            while (this) {
                arrObj0.prop5 = { 6: arrObj0.prop1 };
                for (; arrObj0.prop5.prop1; i32) {
                }
                if (78) {
                    leaf(arguments);
                    break;
                }
            }
        }());
    };
    var func2 = function () {
        eval();
    };
    obj0.method0 = func1;
    obj0.method1 = obj0.method0;
    obj1.method1 = obj0.method1;
    var ary = Array();
    var i32 = new Int32Array();
    arrObj0.prop1 = -195;
    obj0.method0();
    function v37() {
        for (var __loopvar1001 = 7; obj1.method1() ;) {
        }
    }
    var v44 = v37();
}
test0();
test0();
test0();

WScript.Echo('pass');