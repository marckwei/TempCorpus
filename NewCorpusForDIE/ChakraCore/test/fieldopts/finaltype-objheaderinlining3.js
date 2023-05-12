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
    var obj1 = {};
    var protoObj1 = {};
    var func3 = function () {
    };
    obj1.method0 = func3;
    var VarArr0 = Array();
    protoObj1 = Object.create(obj1);
    protoObj1.prop0 = -3503483882018380000;
    VarArr0[0] = -689066480;
    VarArr0[1] = -766274957.9;
    for (var _strvar23 in VarArr0) {
        protoObj1.length = -51;
        for (var _strvar0 in protoObj1) {
            if (_strvar0.indexOf('method') != -1) {
                continue;
            }
            protoObj1[_strvar0] = typeof obj0.prop0;
            protoObj1.method0.call();
            protoObj1 = {
                method0: function () {
                },
                method1: function () {
                }
            };
            protoObj1.prop0 = (protoObj1.prop1);
        }
    }
}
test0();

WScript.Echo('pass');