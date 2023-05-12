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
        name: "Simple lambda function deferral",
        body: function () {
            var a = () => { return 123 };
            assert.areEqual(123, a(), "Lambda with no args but empty parens and body surrounded with curly-braces");
            
            var b = (arg) => { return arg; };
            assert.areEqual(123, b(123), "Lambda with an arg in parens");
            
            var c = (arg1, arg2) => { return arg1 + arg2; };
            assert.areEqual(2, c(1, 1), "Lambda with two args in parens");
            
            var d = () => 123
            assert.areEqual(123, d(), "Lambda with empty arg list and single expression-body");
            
            var e = arg => arg
            assert.areEqual(123, e(123), "Lambda with single arg and single expression-body");
            
            var f = arg => { return arg }
            assert.areEqual(123, f(123), "Lambda with single arg and body in curly-braces");
            
            var g = (arg1, arg2) => arg1 + arg2
            assert.areEqual(2, g(1, 1), "Lambda with two args in parens and single expression body");
        }
    },
    {
        name: "Global lambda function deferral",
        body: function () {
            WScript.LoadScript(`
                var a = () => { return 123 };
                assert.areEqual(123, a(), "Lambda with no args but empty parens and body surrounded with curly-braces");
                
                var b = (arg) => { return arg; };
                assert.areEqual(123, b(123), "Lambda with an arg in parens");
                
                var c = (arg1, arg2) => { return arg1 + arg2; };
                assert.areEqual(2, c(1, 1), "Lambda with two args in parens");
                
                var d = () => 123
                assert.areEqual(123, d(), "Lambda with empty arg list and single expression-body");
                
                var e = arg => arg
                assert.areEqual(123, e(123), "Lambda with single arg and single expression-body");
                
                var f = arg => { return arg }
                assert.areEqual(123, f(123), "Lambda with single arg and body in curly-braces");
                
                var g = (arg1, arg2) => arg1 + arg2
                assert.areEqual(2, g(1, 1), "Lambda with two args in parens and single expression body");
            `);
        }
    },
    {
        name: "Async lambda function deferral",
        body: function () {
            var a = async () => { return 123 };
            assert.isTrue(a() instanceof Promise, "Lambda with no args but empty parens and body surrounded with curly-braces");
            
            var b = async (arg) => { return arg; };
            assert.isTrue(b() instanceof Promise, "Lambda with an arg in parens");
            
            var c = async (arg1, arg2) => { return arg1 + arg2; };
            assert.isTrue(c() instanceof Promise, "Lambda with two args in parens");
            
            var d = async () => 123
            assert.isTrue(d() instanceof Promise, "Lambda with empty arg list and single expression-body");
            
            var e = async arg => arg
            assert.isTrue(e() instanceof Promise, "Lambda with single arg and single expression-body");
            
            var f = async arg => { return arg }
            assert.isTrue(f() instanceof Promise, "Lambda with single arg and body in curly-braces");
            
            var g = async (arg1, arg2) => arg1 + arg2
            assert.isTrue(g() instanceof Promise, "Lambda with two args in parens and single expression body");
        }
    },
    {
        name: "Global async lambda function deferral",
        body: function () {
            WScript.LoadScript(`
                var a = async () => { return 123 };
                assert.isTrue(a() instanceof Promise, "Lambda with no args but empty parens and body surrounded with curly-braces");
                
                var b = async (arg) => { return arg; };
                assert.isTrue(b() instanceof Promise, "Lambda with an arg in parens");
                
                var c = async (arg1, arg2) => { return arg1 + arg2; };
                assert.isTrue(c() instanceof Promise, "Lambda with two args in parens");
                
                var d = async () => 123
                assert.isTrue(d() instanceof Promise, "Lambda with empty arg list and single expression-body");
                
                var e = async arg => arg
                assert.isTrue(e() instanceof Promise, "Lambda with single arg and single expression-body");
                
                var f = async arg => { return arg }
                assert.isTrue(f() instanceof Promise, "Lambda with single arg and body in curly-braces");
                
                var g = async (arg1, arg2) => arg1 + arg2
                assert.isTrue(g() instanceof Promise, "Lambda with two args in parens and single expression body");
            `);
        }
    },
    {
        name: "Global functions using 'yield' as identifier",
        body: function () {
            WScript.LoadScript(`
                var a = async (yield) => { yield };
                assert.isTrue(a() instanceof Promise, "Async lambda with yield as a formal parameter name");

                function b(yield) {
                    return yield;
                }
                assert.areEqual('b', b('b'), "Function with yield as a formal parameter name");

                var c = async (yield) => yield;
                assert.isTrue(c() instanceof Promise, "Async lambda with yield as a formal parameter name and compact body");
                
                async function d(yield) {
                    return yield;
                }
                assert.isTrue(d() instanceof Promise, "Async lambda with yield as a formal parameter name and compact body");
            `);
        }
    },
    {
        name: "Nested functions using 'yield' as identifier",
        body: function () {
            var a = async (yield) => { yield };
            assert.isTrue(a() instanceof Promise, "Async lambda with yield as a formal parameter name");

            function b(yield) {
                return yield;
            }
            assert.areEqual('b', b('b'), "Function with yield as a formal parameter name");

            var c = async (yield) => yield;
            assert.isTrue(c() instanceof Promise, "Async lambda with yield as a formal parameter name and compact body");

            async function d(yield) {
                return yield;
            }
            assert.isTrue(d() instanceof Promise, "Async lambda with yield as a formal parameter name and compact body");
            
            var e = async (a = yield) => { yield };
            assert.isTrue(e() instanceof Promise, "Async lambda with yield in a default argument");
            
            var f = async (a = yield) => yield;
            assert.isTrue(f() instanceof Promise, "Async lambda with compact body and yield in a default argument");
        }
    },
]

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
