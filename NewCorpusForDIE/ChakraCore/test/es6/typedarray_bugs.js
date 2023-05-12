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
    name: "TypedArray.prototype.filter species create order issue",
    body: function () {
        var a = new Int8Array(2);
        var speciesCalled = false;
        Object.defineProperty(a.constructor, Symbol.species, { get : function () { speciesCalled = true; return Int8Array; } });
        function mapFn() {
            throw new Error('Error from mapFn');
        }
        assert.throws(() => a.filter(mapFn), Error, 'Error should be thrown from the mapFn', 'Error from mapFn');
        assert.isFalse(speciesCalled, 'species should not be called as the mapFn throws error');
    }
  },
  {
    name: "TypedArray.prototype.join empty typedarray still evaluate the param",
    body: function () {
        var count = 0;
        var obj = { toString : function () { count++; return ','; } };
        var a = new Int8Array();
        a.join(obj);
        assert.areEqual(count, 1, "a's length is 0 but it should evaluate obj");
        
        count = 0;
        a = new Int8Array(1);
        a.join(obj);
        assert.areEqual(count, 1, "a'length is 1 but it should evaluate obj");
    }
  },
  {
    name: "TypedArray.prototype.join passing 'undefined' should not print that",
    body: function () {
        var a = new Int8Array([11, 22]);
        var ret = a.join(undefined);
        assert.areEqual(ret, "11,22", "join should not join the literal 'undefined' string while joining.");
    }
  },
  {
    name: "TypedArray.prototype.keys/entries/values accept only TypedArray object",
    body: function () {
        function test(fn) {
            var name = fn.name;
            assert.throws(() => fn(), TypeError, name + " function throws when no param passed", "'this' is not a typed array object");
            assert.throws(() => fn.call(), TypeError, name + " function throws when no param passed", "'this' is not a typed array object");
            assert.throws(() => fn.call({}), TypeError, name + " function throws when no TypedArray object passed", "'this' is not a typed array object");
            assert.throws(() => fn.call(new ArrayBuffer(1)), TypeError, name + " function throws when no TypedArray object passed", "'this' is not a typed array object");
        }
        test(Int8Array.prototype.keys);
        test(Int8Array.prototype.values);
        test(Int8Array.prototype.entries);
    }
  },
  {
    name: "TypedArray.prototype.set out of bound offset should throw RangeError",
    body: function () {
        var v = new Int8Array(4);
        assert.throws(() => v.set([1], -1), RangeError);
        assert.throws(() => v.set([1], -1.001), RangeError);
        assert.throws(() => v.set([1], -Infinity), RangeError);
        assert.throws(() => v.set([1], v.length), RangeError);
        assert.throws(() => v.set([1], Infinity), RangeError);
    }
  },
  {
    name: "TypedArray.prototype.subarray range",
    body: function () {
        var v = new Int8Array([11, 22]);
        assert.areEqual(v.subarray(-Infinity), [11, 22], "-Infinity should make the 'begin' to 0");
        assert.areEqual(v.subarray(Infinity), [], "Infinity makes the 'begin' to be same as length");
        assert.areEqual(v.subarray(0, -Infinity), [], "This makes the 'end' to 0");
        assert.areEqual(v.subarray(0, Infinity), [11, 22], "This makes the 'end' to be same as length");
    }
  },
  {
    name: "prototype of the typedarray object should be same when species create invoked",
    body: function () {
        [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array].forEach(function(ctor) {
            var base = new ctor(8);
            
            // This should invoke the TypedArraySpeciesCreate and this will create new typedarray object with same prototype
            var test = base.subarray(0, 1);
            
            assert.areEqual(Object.getPrototypeOf(base), Object.getPrototypeOf(test), "both should have the same prototype");
        });
    }
  },
  {
    name: "typedarray.prototype.keys should take length from internal slot",
    body: function () {
        var a = new Int8Array(4);
        Object.defineProperty(a, 'length', {value : 10});
        var b = a.keys();
        var counter = 0;
        for (var i of b) {
            counter++;
        }
        assert.areEqual(counter, 4, "The iterable object should iterate only 4 times, not 10 times");
    }
  },
  
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
