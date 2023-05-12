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

testRunner.runTests([
    {
        name: "Helpers should not show up in stack traces",
        body() {
            for (const builtin of [Array.prototype.forEach, Array.prototype.filter, Array.prototype.flatMap]) {
                assert.isTrue(typeof(builtin.name) === "string" && builtin.name.length > 0, `Test requires builtin.name to be set for ${builtin.toString()}`);
                try {
                    builtin.call([1, 2, 3], function callback() { throw new Error("error in callback") });
                    assert.isTrue(false, `Exception swallowed from callback for ${builtin.name}`);
                } catch (e) {
                    const frames = e.stack.split("\n");
                    assert.isTrue(/error in callback/.test(frames[0]), `Invalid first frame "${frames[0]}" for ${builtin.name}`);
                    assert.isTrue(/at callback \(/.test(frames[1]), `Invalid second frame "${frames[1]}" for ${builtin.name}`);
                    assert.isTrue(new RegExp(`at Array.prototype.${builtin.name} \\(native code\\)`, "i").test(frames[2]), `Invalid third frame "${frames[2]}" for ${builtin.name}`);
                    assert.isTrue(/at body \(/.test(frames[3]), `Invalid fourth frame "${frames[3]}" for ${builtin.name}`);
                }
            }
        }
    },
    {
        name: "(Existing) JsBuiltIns shouldn't be constructable",
        body() {
            for (const builtin of [
                Array.prototype.values,
                Array.prototype.entries,
                Array.prototype.keys,
                Array.prototype.indexOf,
                Array.prototype.forEach,
                Array.prototype.filter,
                Array.prototype.flat,
                Array.prototype.flatMap,
                Object.fromEntries,
            ]) {
                assert.isTrue(typeof(builtin.name) === "string" && builtin.name.length > 0, `Test requires builtin.name to be set for ${builtin.toString()}`);
                assert.throws(() => new builtin(), TypeError, `${builtin.name} should not be constructable (using new)`, "Function is not a constructor");
                assert.throws(() => Reflect.construct(builtin, []), TypeError, `${builtin.name} should not be constructable (using Reflect.construct target)`, "'target' is not a constructor");
                assert.throws(() => Reflect.construct(function(){}, [], builtin), TypeError, `${builtin.name} should not be constructable (using Reflect.construct newTarget)`, "'newTarget' is not a constructor");
            }
        }
    },
], { verbose: false });
