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

/// <reference path="../UnitTestFramework/UnitTestFramework.js" />
if (this.WScript && this.WScript.LoadScriptFile) {
    WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}


var p = { pp: 123 };

function F() { this.dummy = 12; /*reserve slots, make jit code simpler to read*/ }
F.prototype = p;

function make_object() {
    /// Create new objects of the same Type, and with __proto__ "p"
    return new F();
}

function foo(o) {
    o.x = 1;
    o.y = 2;
}

// Need to run this twice. Test with maxinterpretcount 1 and 2
foo(make_object());
foo(make_object());

var o3 = make_object();

assert.isTrue(Object.getPrototypeOf(o3) === p);
p.__proto__ = { get x() { return "x"; } };

foo(o3);

assert.areEqual("x", o3.x, "Shouldn't add field x");

WScript.Echo("pass");
