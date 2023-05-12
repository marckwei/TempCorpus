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

﻿//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function test0() {
    litObj0.prop0 = {
        prop0: -6498345155050780000,
        prop1: 2147483650,
        prop2: this,
        prop3: uniqobj3
    };
    for (;;) {
        function _array2iterate() {
            _array2iterate();
        }
        litObj0.prop0.v2 = uniqobj3;
        litObj0.prop0.v3 = litObj0;
        litObj0.prop0.v4 = litObj0.prop0.prop3;
        GiantPrintArray.push(litObj0.prop0.v4);
        break;
    }
    obj6.lf0 = uniqobj3.prop3 && this;
    WScript.Echo(GiantPrintArray);
}
var GiantPrintArray = [];
var obj0 = {};
var litObj0 = {};
var func1 = function () {
};
var func3 = function () {
};
obj0.method1 = func1;
protoObj0 = Object();
var uniqobj3 = {
    40: -347315309.9,
    prop0: 1770794796,
    prop3: protoObj0,
    prop7: protoObj0
};
litObj0.prop0 = {
    prop0: -6498345155050780000,
    prop1: 2147483650,
    prop2: this,
    prop3: uniqobj3
};
for (;;) {
    litObj0.prop0.v2 = uniqobj3;
    litObj0.prop0.v3 = litObj0;
    litObj0.prop0.v4 = litObj0;
    break;
}
obj6 = {};
test0();
test0();
