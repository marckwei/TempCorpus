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

// Disabling ES6 Array builtins using this['constructor'] property to construct their return values

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "Array.prototype.concat",
        body: function () {
            var arr = ['a','b','c'];
            arr['constructor'] = Number;

            var out = Array.prototype.concat.call(arr, [1,2,3]);

            assert.isTrue(Array.isArray(out), "Return from Array.prototype.concat should be an Array object");
            assert.isFalse(out instanceof Number, "Return from Array.prototype.concat should not have been constructed from Number");
            assert.areEqual(6, out.length, "Array.prototype.concat sets the length property of returned object");
        }
    },
    {
        name: "Array.prototype.filter",
        body: function () {
            var arr = ['a','b','c'];
            arr['constructor'] = Number;

            var out = Array.prototype.filter.call(arr, function() { return true; });

            assert.isTrue(Array.isArray(out), "Return from Array.prototype.filter should be an Array object");
            assert.isFalse(out instanceof Number, "Return from Array.prototype.filter should not have been constructed from Number");
            assert.areEqual(3, out.length, "Array.prototype.filter does not set the length property of returned object, but it is Array.");
        }
    },
    {
        name: "Array.prototype.map",
        body: function () {
            var arr = ['a','b','c'];
            arr['constructor'] = Number;

            var out = Array.prototype.map.call(arr, function(val) { return val; });

            assert.isTrue(Array.isArray(out), "Return from Array.prototype.map should be an Array object");
            assert.isFalse(out instanceof Number, "Return from Array.prototype.map should not have been constructed from Number");
            assert.areEqual(3, out.length, "Array.prototype.map does not set the length property of returned object, but it is Array.");
        }
    },
    {
        name: "Array.prototype.slice",
        body: function () {
            var arr = ['a','b','c'];
            arr['constructor'] = Number;

            var out = Array.prototype.slice.call(arr);

            assert.isTrue(Array.isArray(out), "Return from Array.prototype.slice should be an Array object");
            assert.isFalse(out instanceof Number, "Return from Array.prototype.slice should not have been constructed from Number");
            assert.areEqual(3, out.length, "Array.prototype.slice sets the length property of returned object");
        }
    },
    {
        name: "Array.prototype.splice",
        body: function () {
            var arr = ['a','b','c','d','e','f'];
            arr['constructor'] = Number;

            var out = Array.prototype.splice.call(arr, 0, 3);

            assert.isTrue(Array.isArray(out), "Return from Array.prototype.splice should be an Array object");
            assert.isFalse(out instanceof Number, "Return from Array.prototype.splice should not have been constructed from Number");
            assert.areEqual(3, out.length, "Array.prototype.splice sets the length property of returned object");
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
