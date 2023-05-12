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
    function makeArrayLength() {
    }
    var obj0 = {};
    var func0 = function () {
    };
    var func1 = function () {
        func0(obj0.prop0 = 1);
        return 776151980;
    };
    obj0.method0 = func1;
    var FloatArr0 = new Array(-244, 3421873769178130000, -7539078262541710000, 799469805.1, 6863152712358460000);
    var VarArr0 = Array();
    var c = 1;
    function bar0() {
        FloatArr0.pop() ? FloatArr0.pop() : 0;
    }
    FloatArr0[obj0.method0()] = 1;
    c = VarArr0.splice(bar0());
    for (var _strvar0 in obj0) {
        FloatArr0[5] = 1;
        if (!0) {
            makeArrayLength(c++);
        }
    }
}
test0();
test0();
test0();
WScript.Echo("Pass");

