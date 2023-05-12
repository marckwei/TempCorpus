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
        name: "Object.setPrototypeOf(proxy), setPrototypeOf trap returns false",
        body() {
            var called = false;
            var proxy = new Proxy({}, { setPrototypeOf() { called = true; return false; } });

            assert.throws(() => Object.setPrototypeOf(proxy, {}), TypeError, "expected TypeError", "Proxy trap `setPrototypeOf` returned false");
            assert.areEqual(true, called, "`setPrototypeOf` trap was called");
        }
    },
    {
        name: "Assignment to proxy.__proto__, setPrototypeOf trap returns false",
        body() {
            var called = false;
            var proxy = new Proxy({}, { setPrototypeOf() { called = true; return false; } });

            assert.throws(() => proxy.__proto__ = {}, TypeError, "expected TypeError", "Proxy trap `setPrototypeOf` returned false");
            assert.areEqual(true, called, "`setPrototypeOf` trap was called");
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
