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

// ES6 Function unit tests from bugfixes

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "OS1558391: assignment to 'length' after defineProperty with getter function should not trigger assertion",
        body: function() {
            function f() { }
            Object.defineProperty(f, 'length', {
                get: function () { }
            });
            assert.doesNotThrow(function () { f.length = 1; }, "assertion failure on assignment to 'length' after defineProperty with getter");
         }
    },
    {
        name: "OS1616633: defineProperty with getter function after sealing a function object should not trigger assertion",
        body: function() {
            function g(name) {
                var f=function () { }
                Object.seal(f);
                Object.defineProperty(f, name, {
                    get: function () { }
                    });
            }
            assert.throws(function () { g('length') }, TypeError, "Cannot redefine non-configurable property 'length'");
            assert.throws(function () { g('arguments') }, TypeError, "Cannot redefine non-configurable property 'arguments'");
            assert.throws(function () { g('caller') }, TypeError, "Cannot redefine non-configurable property 'caller'");
         }
    },
    {
        name: "OS1658052: defineProperty with value after sealing a function object should not trigger assertion",
        body: function() {
            function g(name) {
                var f=function () { }
                Object.seal(f);
                Object.defineProperty(f, name, {
                    value: 0
                    });
            }
            assert.doesNotThrow(function () { g('length') }, "assertion failure on defineProperty 'length' with value after sealing a function object");
            assert.throws(function () { g('arguments') }, TypeError, "Cannot redefine non-configurable property 'arguments'");
            assert.throws(function () { g('caller') }, TypeError, "Cannot redefine non-configurable property 'caller'");
         }
    },
    {
        name: "OS1893544: defineProperty with {writable: false, configurable:true} after defineProperty with getter on a function object should not trigger assertion",
        body: function() {
            function g(name) {
                var f=function () { }
                Object.defineProperty(f, name, {
                    get: function () { },
                    });
                Object.defineProperty(f, name, {
                    writable: false,
                    configurable: true
                    });
            }
            assert.doesNotThrow(function () { g('length') }, "assertion failure on defineProperty 'length' with {writable: false, configurable:true} after defineProperty with getter on a function object");
            assert.throws(function () { g('arguments') }, TypeError, "Cannot redefine non-configurable property 'arguments'");
            assert.throws(function () { g('caller') }, TypeError, "Cannot redefine non-configurable property 'caller'");
         }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

