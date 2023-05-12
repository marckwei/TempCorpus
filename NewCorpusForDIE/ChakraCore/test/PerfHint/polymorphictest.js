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

// jshost.exe -trace:perfhint -off:simplejit -maxinterpretcount:5 polymorphictest.js

var arg = "arg";
var iter = 100;
function foo1(arg1) {
    var string = "that: " + this.that1 + ", arg: " + arg1;
    return string;
}

function foo2(arg2) {
    var string = "that: " + this.that2 + ", arg: " + arg2;
    return string;
}

function foo3(arg3) {
    var string = "that: " + this.that3 + ", arg: " + arg3;
    return string;
}

function foo4(arg4) {
    var string = "that: " + this.that4 + ", arg: " + arg4;
    return string;
}

function foo5(arg5) {
    var string = "that: " + this.that5 + ", arg: " + arg5;
    return string;
}

function Test1() {
    var o1 = { foo: foo1, that1: "that1"};
    var o2 = { foo: foo2, that2: "that2"};
    var o3 = { foo: foo3, that3: "that3"};
    var o4 = { foo: foo4, that4: "that4"};
    var o5 = { foo: foo5, that5: "that5"};

    function test(obj) {
        arg += "foo";
        obj.foo(arg);
    }
    test(o1);
    test(o2);
    test(o3);
    test(o4);

    for (var i = 0; i < iter; i++) {
        result = test(o5);
    }
}

Test1();