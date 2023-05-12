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
    this.WScript.LoadScriptFile("util.js");
}

var tests = [
    {
        name: "Typed arrays support delete of non-indexed properties",
        body: function () {
            const ta = Int8Array.of(42);

            ta.non_indexed = 'whatever';
            assert.areEqual('whatever', ta.non_indexed, "ta.non_indexed is set to 'whatever'");

            var res = delete ta.non_indexed;
            assert.areEqual(true, res, "delete of configurable non-indexed property should succeed");
            assert.areEqual(undefined, ta.non_indexed, "ta.non_indexed has been deleted");
        }
    },
    {
        name: "Deleting of non-configurable non-indexed properties on Typed arrays",
        body: function () {
            const ta = Int8Array.of(42);
            var id = 'id';
            Object.defineProperty(ta, id, { value: 17, configurable: false });

            var res = delete ta[id];
            assert.areEqual(false, res, "delete of non-configurable property should fail");
            assert.areEqual(17, ta[id], "ta['id'] value after failed delete");

            assert.throws(function () { 'use strict'; delete ta[id]; }, TypeError, "Should throw on delete of non-indexed property in typed array", "Calling delete on 'id' is not allowed in strict mode");
        }
    },
    {
        name: "Typed arrays don't support delete of indexed properties",
        body: function () {
            const ta = Int8Array.of(42);

            var res = delete ta[0];
            assert.areEqual(false, res, "delete of ta[0] should fail");
            assert.areEqual(42, ta[0], "ta[0] value after failed delete");

            assert.throws(function () { 'use strict'; delete ta[0]; }, TypeError, "Should throw on delete of indexed property in typed array", "Calling delete on '0' is not allowed in strict mode");
        }
    },
    {
        name: "Typed arrays ignore delete of the inherited 'length' property",
        body: function () {
            const ta = Int8Array.of(42);

            var res = delete ta.length;
            assert.areEqual(true, res, "delete of ta.length should succeed (as noop)");
            assert.areEqual(1, ta.length, "ta.length after attempting to delete it");

            res = (function () { 'use strict'; return delete ta.length; })();
            assert.areEqual(true, res, "delete of ta.length should succeed (as noop) in strict mode");
            assert.areEqual(1, ta.length, "ta.length after attempting to delete it in strict mode");
        }
    },
];

testRunner.runTests(tests, { verbose: false /*so no need to provide baseline*/ });
