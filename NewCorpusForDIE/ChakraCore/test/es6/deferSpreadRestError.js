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
    name: "Deferred spread/rest errors in lambda formals",
    body: function () {
      assert.doesNotThrow(function () { (a, b = [...[1,2,3]], ...rest) => {}; },     "Correct spread and rest usage");
      assert.doesNotThrow(function () { (a, b = ([...[1,2,3]]), ...rest) => {}; },   "Correct spread and rest usage with added parens");
      assert.doesNotThrow(function () { (a, b = (([...[1,2,3]])), ...rest) => {}; }, "Correct spread and rest usage with added parens");
      assert.throws(function () { eval("(a = ...NaN, b = [...[1,2,3]], ...rest) => {};"); },
                    SyntaxError,
                    "Invalid spread with valid rest throws on the first invalid spread",
                    "Unexpected ... operator");
      assert.throws(function () { eval("(a = (...NaN), ...b = [...[1,2,3]], ...rest) => {};"); },
                    SyntaxError,
                    "Invalid spread in parens with invalid and valid rest throws on the first invalid spread",
                    "Invalid use of the ... operator. Spread can only be used in call arguments or an array literal.");
      assert.throws(function () { eval("(a = (...NaN), ...b = [...[1,2,3]], rest) => {};"); },
                    SyntaxError,
                    "Invalid spread in parens with invalid rest throws on the first invalid spread",
                    "Invalid use of the ... operator. Spread can only be used in call arguments or an array literal.");
      assert.throws(function () { eval("(a = [...NaN], ...b = [...[1,2,3]], rest) => {};"); },
                    SyntaxError,
                    "Invalid spread (runtime error) with invalid rest throws on the first invalid rest",
                    "Unexpected ... operator");
      assert.throws(function () { eval("(a, ...b, ...rest) => {};"); },
                    SyntaxError,
                    "Invalid rest with valid rest throws on the first invalid rest",
                    "Unexpected ... operator");
      assert.throws(function () { eval("(...rest = ...NaN) => {};"); },
                    SyntaxError,
                    "Invalid rest with invalid spread initializer throws on the invalid rest",
                    "The rest parameter cannot have a default initializer.");
    }
  },
    {
        name: "Nested parenthesized expressions",
        body: function () {
            assert.throws(function () { eval("(function f() { if (...mznxbp) { (mmqykj) => undefined; } });"); }, 
                          SyntaxError, 
                          "Parenthesized expression outside a function does not contribute to nested count",
                          "Invalid use of the ... operator. Spread can only be used in call arguments or an array literal.");
            assert.throws(function () { eval("(a, (...b, ...a))"); }, 
                          SyntaxError, 
                          "Nested parenthesized expression throws rest error before deferred spread error",
                          "Unexpected ... operator");
            assert.throws(function () { eval("((...a)) => 1"); }, 
                          SyntaxError, 
                          "Nested parenthesized expression as lambda formals throws deferred spread error",
                          "Invalid use of the ... operator. Spread can only be used in call arguments or an array literal.");
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });