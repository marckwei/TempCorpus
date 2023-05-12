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
        name: "Object.prototype.__lookupGetter__ -> [[GetOwnProperty]], [[GetPrototypeOf]]",
        body: function () {
            // Object.prototype.__lookupGetter__ -> [[GetOwnProperty]]
            // Object.prototype.__lookupGetter__ -> [[GetPrototypeOf]]
            var gopd = [];
            var gpo = false;
            var p = new Proxy({}, 
            {
                getPrototypeOf: function(o) { gpo = true; return Object.getPrototypeOf(o); },
                getOwnPropertyDescriptor: function(o, v) { gopd.push(v); return Object.getOwnPropertyDescriptor(o, v); }
            });
            Object.prototype.__lookupGetter__.call(p, "foo");
            assert.areEqual(1, gopd.length, "getOwnPropertyDescriptor should only be called once");
            assert.areEqual("foo", gopd[0], "getOwnPropertyDescriptor should be called with foo");
            assert.isTrue(gpo, "getPrototypeOf should be called");
        }
    },
    {
        name: "Object.prototype.__lookupSetter__ -> [[GetOwnProperty]], [[GetPrototypeOf]]",
        body: function () {
            // Object.prototype.__lookupSetter__ -> [[GetOwnProperty]]
            // Object.prototype.__lookupSetter__ -> [[GetPrototypeOf]]
            var gopd = [];
            var gpo = false;
            var p = new Proxy({}, 
            {
                getPrototypeOf: function(o) { gpo = true; return Object.getPrototypeOf(o); },
                getOwnPropertyDescriptor: function(o, v) { gopd.push(v); return Object.getOwnPropertyDescriptor(o, v); }
            });
            Object.prototype.__lookupSetter__.call(p, "foo");
            assert.areEqual(1, gopd.length, "getOwnPropertyDescriptor should only be called once");
            assert.areEqual("foo", gopd[0], "getOwnPropertyDescriptor should be called with foo");
            assert.isTrue(gpo, "getPrototypeOf should be called");
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
