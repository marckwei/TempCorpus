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

// ES7 Object Prototype object has an immutable [[Prototype]] internal slot
// See: 19.1.3 Properties of the Object Prototype Object
// See: 9.4.7 Immutable Prototype Exotic Objects

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "Not okay to set Object.prototype.[[Prototype]] using __proto__",
        body: function () {
            var objectPrototypeObject = Object.getPrototypeOf(Object.prototype)
            var b = Object.create(null)

            assert.throws(function () { Object.prototype.__proto__ = b },
                TypeError,
                "It should not be okay to set Object.prototype.[[Prototype]] using __proto__",
                "Can't set the prototype of this object.")

            assert.areEqual(objectPrototypeObject, Object.prototype.__proto__, "Object.prototype.__proto__ is unchanged")
            assert.areEqual(objectPrototypeObject, Object.getPrototypeOf(Object.prototype), "Object.getPrototypeOf(Object.prototype) is unchanged")
        }
    },
    {
        name: "Not okay to set Object.prototype.[[Prototype]] using Object.setPrototypeOf",
        body: function () {
            var objectPrototypeObject = Object.getPrototypeOf(Object.prototype)
            var b = Object.create(null)

            assert.throws(function () { Object.setPrototypeOf(Object.prototype, b) },
                TypeError,
                "It should not be okay to set Object.prototype.[[Prototype]] using Object.setPrototypeOf",
                "Can't set the prototype of this object.")

            assert.areEqual(objectPrototypeObject, Object.prototype.__proto__, "Object.prototype.__proto__ is unchanged")
            assert.areEqual(objectPrototypeObject, Object.getPrototypeOf(Object.prototype), "Object.getPrototypeOf(Object.prototype) is unchanged")
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
