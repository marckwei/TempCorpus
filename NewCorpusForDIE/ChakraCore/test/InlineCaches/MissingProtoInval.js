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

function f1() {
    var o1 = {},o2 = {};
    var proto1 = {a:'a',b:'b'},proto2 = {a:'a'};
    o1.__proto__ = proto1;
    o2.__proto__ = proto2;

    function a(o) { return o.a; }
    function b(o) { return o.b; }

    a(o1);
    a(o2);
    b(o1);
    b(o2);
    proto2.__proto__ = {b:'b'};
    if (b(o2) !== 'b') {
        WScript.Echo('fail');
    }
}

f1()
f1();

function f2() {
    var o1 = {b:'b'},o2 = {b:'b'};
    var proto1 = {a:'a',b:'b'},proto2 = {a:'a'};
    o1.__proto__ = proto1;
    o2.__proto__ = proto2;

    function a(o) { return o.a; }
    function b(o) { return o.b; }

    a(o1);
    a(o2);

    delete o1.b;
    delete o2.b;

    b(o1);
    b(o2);
    proto2.__proto__ = {b:'b'};
    if (b(o2) !== 'b') {
        WScript.Echo('fail');
    }
}

f2();
f2();

WScript.Echo('pass');
