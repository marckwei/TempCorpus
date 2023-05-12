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

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    {
        name: "22.1.3.7: Array.prototype.filter basic case",
        body: function () {
            const a = [2, 1, 0];
            let predicate = function (value, index, obj) {
                assert.areEqual(obj[index], value);
                return value >= index;
            };
            const b = a.filter(predicate);
            assert.areEqual("2,1", b.join(","), "filtered array");
        }
    },
    {
        name: "22.1.3.7: Array.prototype.filter should skip missing items",
        body: function () {
            const a = [1, 2, 3];
            delete a[1];
            let callCount = 0;
            let predicate = function (value, index, obj) {
                assert.areEqual(obj[index], value);
                callCount += 1;
                return true;
            };
            let b = a.filter(predicate);
            assert.areEqual(2, callCount, "visited two items only");
            assert.areEqual("1,3", b.join(","), "filtered array");
        }
    },
    {
        name: "22.1.3.7: mutating array after Array.prototype.filter has started",
        body: function () {
            let a = [1, 2, 3];
            let callCount = 0;
            let predicate = function (value, index, obj) {
                assert.areEqual(obj[index], value);
                callCount += 1;

                if (index === 0) {
                    delete a[1]; // should be skipped
                    a[2] = 4; // new value should be used
                    a[4] = 5; // added items shouldn't be visited
                }
                return true;
            };
            let b = a.filter(predicate);
            assert.areEqual(2, callCount, "visited two items only");
            assert.areEqual("1,4", b.join(","), "filtered array");
            assert.areEqual("1,,4,,5", a.join(","), "mutated array");
        }
    },
    {
        name: "22.1.3.7: Array.prototype.filter should call ArraySpeciesCreate which relies on 'constructor' property",
        body: function () {
            const a = [1, 2, 3];
            Object.defineProperty(a, 'constructor', {
                get: function () {
                    throw new Error("13");
                }
            });
            assert.throws(function () { a.filter(function () { }); }, Error, "Should throw from constructor", "13");
        }
    },
    {
        name: "22.1.3.7: Array.prototype.filter might provide 'this' argument to the callback",
        body: function () {
            const a = [5, 6, 7];
            let that = { calls: 0 };
            let predicate = function (value, index, obj) {
                this.calls++;
                return false;
            };
            const b = a.filter(predicate, that);
            assert.areEqual(3, that.calls, "context's 'calls' property");
            assert.areEqual("", b.join(","), "const 'false' filter should produce empty result");
        }
    },
    {
        name: "22.1.3.7: Array.prototype.filter is generic and can be applied to other objects",
        body: function () {
            let a = { 0: "a", 1: "bc", 2: "de" }
            a.length = 3;
            let predicate = function (value, index, obj) {
                assert.areEqual(obj[index], value);
                return value.length > index;
            };
            const b = Array.prototype.filter.call(a, predicate);
            assert.areEqual("a,bc", b.join(","), "filtered object");
        }
    }
];

testRunner.runTests(tests, { verbose: false /*so no need to provide baseline*/ });