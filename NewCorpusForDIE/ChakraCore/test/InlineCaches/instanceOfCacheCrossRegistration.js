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

function write(v) { WScript.Echo(v + ""); }

var obj = [];
var proto_1 = [];
var proto_2 = [];
var count = 2;

function Ctor1()
{
    this.x = 0;
    this.y = 1;
}

function Ctor2() {
    this.a = 0;
    this.b = 1;
}

function test(o1, o2, ctor1, ctor2)
{
    var isO1Ctor1 = o1 instanceof ctor1;
    var isO2Ctor1 = o2 instanceof ctor1;
    write("o1 instanceof ctor1: " + isO1Ctor1);
    write("o2 instanceof ctor1: " + isO2Ctor1);
}

var o1 = new Ctor1();
var o2 = new Ctor2();
test(o1, o2, Ctor1, Ctor2);
Ctor1.prototype = { x: 10, y: 20 };
test(o1, o2, Ctor1, Ctor2);
