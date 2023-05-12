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

const dotAllMatch = [
    "hel\nlo",
    "hel\rlo",
    "hel\u2028lo",
    "hel\u2029lo"
];

const alwaysMatch = [
    "hel\vlo", 
    "hel\flo",
    "hel\u0085lo"
];

const neverMatch = [
    "hel\n\nlo",
    "hel\rllo",
    "hel\u2028llo",
    "hell\u2029lo",
    "hel \vlo", 
    "hel \flo",
    "hel \u0085lo"
];

const tests = [
    {
        name : "Match without dotAll",
        body : function ()
        {
            const reg = /hel.lo/;
            neverMatch.forEach(function (string) {
                assert.isFalse(reg.test(string), "Shouldn't match");
            });
            dotAllMatch.forEach(function (string) {
                assert.isFalse(reg.test(string), "Shouldn't match - strings that match with dotAll flag without the flag");
            });
            alwaysMatch.forEach(function (string) {
                assert.isTrue(reg.test(string), "Should match - strings that match without dotAll flag");
            });
        }
    },
    {
        name : "Match with dotAll",
        body : function ()
        {
            const reg = /hel.lo/s;
            neverMatch.forEach(function (string) {
                assert.isFalse(reg.test(string), "Shouldn't match");
            });
            dotAllMatch.forEach(function (string) {
                assert.isTrue(reg.test(string), "Should match - strings that match with dotAll flag");
            });
            alwaysMatch.forEach(function (string) {
                assert.isTrue(reg.test(string), "Should match - strings that match without dotAll flag");
            });
        }
    },
    {
        name : "Properties of dotAll property",
        body : function ()
        {
            const withFlag = /stuff/s;
            const withoutFlag = /stuff/;
            assert.isTrue(withFlag.dotAll, "dotAll flag has correct value");
            assert.isFalse(withoutFlag.dotAll, "dotAll flag has correct value");

            assert.isTrue(delete withFlag.dotAll, "deleting dotAll property returns true");
            assert.doesNotThrow(()=>{"use strict"; delete withFlag.dotAll;}, "deleting dotAll property does not throw in strict mode");

            assert.isTrue(delete withoutFlag.dotAll, "deleting dotAll property returns true");
            assert.doesNotThrow(()=>{"use strict"; delete withoutFlag.dotAll;}, "deleting dotAll property does not throw in strict mode");

            assert.isFalse(withFlag.hasOwnProperty("dotAll"), "dotAll property is not a property of individual RegExp");
            assert.isFalse(withoutFlag.hasOwnProperty("dotAll"), "dotAll property is not a property of individual RegExp");
        }
    },
    {
        name : "Properties of prototype dotAll property",
        body : function ()
        {
            const dotAll = RegExp.prototype.dotAll;
            assert.isTrue(RegExp.prototype.hasOwnProperty("dotAll"), "RegExp prototype has dotAll property");
            const desc = Object.getOwnPropertyDescriptor(RegExp.prototype, "dotAll");

            assert.isTrue(desc.configurable, "dotAll property of prototype is configurable");
            assert.isFalse(desc.enumerable, "dotAll property of prototype is not enumerable");

            assert.areEqual(dotAll, undefined, "dotAll property of prototype is undefined");

            RegExp.prototype.dotAll = 5;
            assert.areEqual(dotAll, undefined, "writing to dotAll property of prototype is a no-op");

            assert.isTrue(delete RegExp.prototype.dotAll, "deleting dotAll property returns true");
            assert.isFalse(RegExp.prototype.hasOwnProperty("dotAll"), "RegExp prototype has no dotAll property after deletion");

            const withFlag = /stuff/s;
            const withoutFlag = /stuff/;
            assert.areEqual(withFlag.dotAll, undefined, "After deleting dotAll from prototype its undefined");
            assert.areEqual(withoutFlag.dotAll, undefined, "After deleting dotAll from prototype its undefined");
       }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
