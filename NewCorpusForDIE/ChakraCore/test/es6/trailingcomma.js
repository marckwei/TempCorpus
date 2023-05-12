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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "Trailing comma in function",
        body: function () {
            assert.doesNotThrow(function () { eval("function foo(a,) {}"); }, "Trailing comma in function declaration is a valid syntax");
            assert.doesNotThrow(function () { eval("function foo(a,) {'use strict'; }"); }, "Trailing comma in function declaration under strict mode is a valid syntax");
            assert.throws(function () { eval("function foo(a, ,) {}"); }, SyntaxError, "More than one trailing comma is not valid syntax", "Expected identifier");
            assert.throws(function () { eval("function foo(...a,) {}"); }, SyntaxError, "Trailing comma after rest is not valid syntax", "The rest parameter must be the last parameter in a formals list.");
            assert.throws(function () { eval("function foo(...[a],) {}"); }, SyntaxError, "Trailing comma after rest pattern is not valid syntax", "The rest parameter must be the last parameter in a formals list.");
            assert.throws(function () { eval("function foo(,) {}"); }, SyntaxError, "Trailing comma after missing name is not valid syntax", "Expected identifier");
            function f1(a,b,) {}
            assert.areEqual(f1.length, 2, "Function's length is not affected by a trailing comma");
        }
    },
    {
        name: "Trailing comma in call expression",
        body: function () {
            assert.doesNotThrow(function () { eval("function foo() {}; foo(1, 2,);"); }, "Trailing comma in a user function call is a valid syntax");
            assert.doesNotThrow(function () { eval("Math.min(1, 2, );"); }, "Trailing comma in built-in function call is a valid syntax");
        }
    },
    {
        name: "Trailing comma in arrow function",
        body: function () {
            assert.doesNotThrow(function () { eval("(a,) => {}"); }, "Trailing comma in an arrow function is a valid syntax");
            assert.doesNotThrow(function () { eval("let f = (a,) => {}"); }, "Trailing comma in an arrow function is a valid syntax");
            assert.doesNotThrow(function () { eval("(b = (a,) => {}) => {}"); }, "Trailing comma in an nested arrow function is a valid syntax");
            assert.doesNotThrow(function () { eval("({b = (a,) => {}}) => {}"); }, "Trailing comma in an nested arrow function in destructuring is a valid syntax");
            assert.throws(function () { eval("(b = (a,)) => {}"); }, SyntaxError, "Trailing comma in a comma expression is not valid syntax");
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
