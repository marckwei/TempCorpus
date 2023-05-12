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
//switches: -forcearraybtree

// x86debug: lib\runtime\Library/JavascriptArray.inl, current->left >= lastindex
function test0() {
    var arr = [4294967296];
    arr[9] = 19;
    arr.unshift(1, 2, {}, 4, 5, 6, 7, 8, 9, 10, 11, 12);
}

// x64debug: lib\Runtime\Library\SparseArraySegment.cpp, length <= size
function test1() {
    function makeArrayLength() {
      return 100;
    }
    var obj0 = {};
    var protoObj0 = {};
    var obj1 = {};
    var arrObj0 = {};
    var func0 = function () {
    };
    var func1 = function () {
    };
    obj0.method1 = func0;
    var ary = Array();
    var IntArr1 = new Array();
    IntArr1[15] = ~obj1.prop0;
    arrObj0.length = makeArrayLength();
    IntArr1[10] = arrObj0.length;
    makeArrayLength(IntArr1.unshift(func1(), ary, obj0.method1(), protoObj0, Object(), arrObj0, -1877547837));
}

test0();
test1();
console.log("Pass");
