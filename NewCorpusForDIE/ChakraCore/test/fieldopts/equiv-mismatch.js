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

// Check the case where not all of the upstream equiv set's types are equivalent
// at a downstream access.

var FixedFuncArr = [];
function bar() {
}
FixedFuncArr.push(bar);
function GetFunction() {
    var myFunc = FixedFuncArr.shift();
    FixedFuncArr.push(myFunc);
    return myFunc;
}
function PolyMorphicObjGenerator() {
    var obj = {};
    obj.fixedfunc1 = GetFunction();
    return obj;
}
function test0() {
    var _isntObj0 = PolyMorphicObjGenerator();
    var _protoObj0 = Object.create(_isntObj0);
    var GiantPrintArray = [];
    var arrObj0 = {};
    var func2 = function () {
        arrObj0.prop0;
        arrObj0.v2 = 1924086187;
        _protoObj0.fixedfunc1();
        GiantPrintArray.push(arrObj0.v2);
    };
    arrObj0.prop0 = 1458470962.1;
    CollectGarbage();
    CollectGarbage();
    func2();
    func2();
    func2();
    WScript.Echo(GiantPrintArray);
}
test0();
test0();
