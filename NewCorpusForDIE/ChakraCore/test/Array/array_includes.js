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

// ES6 Array.prototype.includes(x,y) API extension tests -- verifies the API shape and basic functionality

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    {
        name: "Array.prototype.includes range test cases",
        body: function () {
            var x = [1, 2, 2, 4, 5, 0, NaN, 0, true, true , false, undefined, 1.1, 2.4]

            for(var i=0; i < x.length; i++)
            {
                assert.isTrue(x.includes(x[i]), "includes returns true for valid search values in the array range including NaN and undefined")
            }
            assert.isTrue(x.includes(-0), "includes treats -0 and +0 as same");
        }
    },
    {
        name: "Array.prototype.includes out of range test cases",
        body: function () {
            var x = [1, 2, 2, 4, 5, 0, NaN, 0, true, true , false, undefined, 1.1, 2.4]

            assert.isFalse(x.includes(1, 1), "includes(1, 1): out of range values should return false");
            assert.isFalse(x.includes(-0, 10), "includes(-0, 10): out of range values should return false");
            assert.isFalse(x.includes(undefined, x.length - 2), "includes(undefined, x.length - 2): out of range values should return false");
            assert.isFalse(x.includes(10), "includes(10): out of range values should return false");
            assert.isFalse(x.includes(null), "includes(null): out of range values should return false");
        }
    },
    {
        name: "Array.prototype.includes works with native arrays",
        body: function () {
            var x = [1, 2, 2, 4, 5, 0]; //native int array
            assert.isTrue(x.includes(2), "includes(2): includes return true for search hits");
            assert.isTrue(x.includes(0), "includes(0): includes return true for search hits");
            assert.isFalse(x.includes(3), "includes(3): includes return false for search miss");
            assert.isFalse(x.includes(1.2), "includes(1.2): includes return false for search miss");
            assert.isFalse(x.includes(undefined), "includes(undefined): includes return false for search miss");
            assert.isTrue(x.includes(2, -5), "includes(2, -5): includes return true for search hit");
            assert.isFalse(x.includes(2, -1), "includes(2, -1): includes return false for search miss");
            assert.isTrue(x.includes(-0), "includes(-0): includes return true for search hit");

            var x = [1,2, 1.2, 2.3, -2.8, 4, 5, 0]; //native float array
            assert.isTrue(x.includes(2.3), "includes(2.3): includes return true for search hits");
            assert.isTrue(x.includes(0), "includes(0): includes return true for search hits");
            assert.isFalse(x.includes(-2.9), "includes(-2.9): includes return false for search miss");
            assert.isTrue(x.includes(1.2), "includes(1.2): includes return false for search miss");
            assert.isFalse(x.includes(undefined), "includes(undefined): includes return false for search miss");
            assert.isTrue(x.includes(2.3, -5), "includes(2.3, -5): includes return true for search hit");
            assert.isFalse(x.includes(2, -1), "includes(2, -1): includes return false for search miss");
            assert.isTrue(x.includes(-0), "includes(-0): includes return true for search hit");
            assert.isTrue(x.includes(-0, -200), "includes(-0, -200): includes return true for search hit");

            assert.isFalse(x.includes(2, 100), "includes(2, 100): includes return true for search hit");

        }
    },
    {
        name: "Array.prototype.includes works with missing elements in arrays",
        body: function () {
            var x = [1, 2, 2, 4, 5, 0]; //native int array
            x[1000] = 25;
            assert.isTrue(x.includes(undefined), "includes(undefined): includes return true for search hit");

            var x = [1,2, 1.2, 2.3, -2.8, 4, 5, 0]; //native float array
            x[1000] = 25.5;
            assert.isTrue(x.includes(undefined), "includes(undefined): includes return true for search hit");

            var x = [ 1, 2, -0, "x"];
            x[1000] = 25.5;
            assert.isTrue(x.includes(undefined), "includes(undefined): includes return true for search hit");
        }
    },
    {
        name: "Array.prototype.includes walks prototype with missing elements in arrays",
        body: function () {
            //implicit calls
            var marker = false;
            var arr = [10];
            Object.defineProperty(Array.prototype, "4", {configurable : true, get: function(){return 30;}});
            arr.length = 6;
            assert.isTrue(arr.includes(30), "includes(30): includes successful in searching prototype values");
            assert.isTrue(arr.includes(undefined), "includes(undefined): includes return true for search hit invoking prototype");

            arr = [10.1];
            arr.length = 6;
            assert.isTrue(arr.includes(30), "includes(30): includes successful in searching prototype values");
            assert.isTrue(arr.includes(undefined), "includes(undefined): includes return true for search hit invoking prototype");
            assert.isTrue(arr.includes(30, 2), "includes(30, 2): includes successful in searching prototype values");
            assert.isTrue(arr.includes(undefined, 4), "includes(undefined, 4): includes return true for search hit invoking prototype");

            arr = ["x"];
            arr.length = 6;
            assert.isTrue(arr.includes(30), "includes(30): includes successful in searching prototype values");
            assert.isTrue(arr.includes(undefined), "includes(undefined): includes return true for search hit invoking prototype");
            assert.isTrue(arr.includes(30, -4), "includes(30, -4): includes successful in searching prototype values");
            assert.isTrue(arr.includes(undefined, -2), "includes(undefined, -2): includes return true for search hit invoking prototype");

        }
    },
    {
        name: "Array.prototype.includes built-in length is 1",
        body: function () {
            assert.areEqual(1, [].includes.length, "includes built-in length is 1");
        }
    },
    {
        name: "Array.prototype.includes built-in works for object",
        body: function () {

            var b = function(){};
            b.prototype = Array.prototype;
            var y = new b();
            var a = {};

            y[0] = "abc";
            y[1] = "def";
            y[2] = "efg";
            y[3] = true;
            y[4] = true;
            y[5] = false;
            y[6] = a;
            y[7] = a;
            y[8] = null;
            y[9] = NaN;

            y.length = 11;

            assert.isTrue(y.includes("abc"), "includes('abc'): includes return true for search hit");
            assert.isFalse(y.includes("abc", 3), "includes('abc', 3): includes return false for search miss");
            assert.isFalse(y.includes("abc", 2), "includes('abc', 2): includes return false for search miss");
            assert.isFalse(y.includes("abc", -2), "includes('abc', -2): includes return false for search miss");
            assert.isFalse(y.includes("xyg"), "includes('xyg'): includes return false for search miss");
            assert.isFalse(y.includes("", -2), "includes('', -2): includes return false for search miss");
            assert.isFalse(y.includes(new Boolean(true)), "includes(new Boolean(true)): includes return false for search miss");
            assert.isTrue(y.includes(NaN), "includes(NaN): includes return true for search hit");
            assert.isTrue(y.includes(undefined), "includes(undefined):includes return true for search hit");
        }
    },
    {
        name: "Array.prototype.includes with proxy to validate that has is not called",
        body: function () {

            var calls = 0;
            var p = new Proxy({}, {
                get : function(_, k) {
                    if (k == 'length') {
                        return 4;
                    }
                    calls++
                    return k*2;
                }
            });

            var a = [].includes.call(p, 100);
            assert.areEqual(calls, 4, "Even though 'has' is not there get will be called 4 times");
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });