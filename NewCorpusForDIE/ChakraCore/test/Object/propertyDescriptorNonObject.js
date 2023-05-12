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
        name: "Object.create with propertyDescriptor containing non-object keys",
        body: function() {
            assert.throws(function() { Object.create({}, {a: 0}) },
                TypeError,
                "Should throw TypeError because property 'a' is not an object.",
                "Invalid descriptor for property 'a'")
        }
    },
    {
        name: "Object.defineProperty with number for propertyDescriptor",
        body: function() {
            assert.throws(function() { Object.defineProperty({}, "x", 0) },
                TypeError,
                "Should throw TypeError because property 'x' is a number.",
                "Invalid descriptor for property 'x'")
        }
    },
    {
        name: "Object.create with array of non-objects for propertyDescriptor",
        body: function() {
            assert.throws(function() { Object.create({}, [0]) },
                TypeError,
                "Should throw TypeError because propertyDescriptor is an array containing non-objects.",
                "Invalid descriptor for property '0'")
        }
    },
    {
        name: "Object.create in sloppy mode with `this` as a propertyDescriptor when it contains non-object properties",
        body: function() {
            assert.throws(function() { Object.create({}, this) },
                TypeError,
                "Should throw TypeError because property Symbol.toStringTag is defined on `this` and is a non-object.",
                "Invalid descriptor for property 'Symbol.toStringTag'")
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
