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

try {
    var obj0 = {};
    var obj1 = {};
    var litObj1 = { prop0: 0 };
    var func0 = function(argArr0, argMath1) {
        '!'.concat(argArr0.push(argMath1 + obj0.prop0, typeof (argMath1 == protoObj0.prop0 || d !== protoObj1.prop1)));
        while(protoObj1.prop0 > this && obj1.prop0 < argMath1) {
        }
    };
    var func4 = function() {
        var uniqobj0 = Object.create(protoObj1);
    };
    obj0.method0 = func0;
    var IntArr1 = [];
    var VarArr0 = Array();
    var d = -546775238;
    protoObj0 = Object(obj0);
    protoObj1 = Object.create(obj1);
    protoObj0.prop0 = 598651799761878000;
    protoObj1.prop0 = 219874657;
    obj0.method0.call(protoObj0, IntArr1);
    obj0.method0(VarArr0, protoObj1 << true);
    IntArr1(obj0.method0(func4()));
} catch(ex) {
}

WScript.Echo("pass");
