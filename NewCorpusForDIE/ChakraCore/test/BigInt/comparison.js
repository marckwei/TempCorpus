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
        name: "Compare BigInt literal",
        body: function () {
            assert.isTrue(123n == 123n);
            assert.isTrue(123n < 1234n);
            assert.isFalse(123n > 1234n);
            assert.isFalse(123n == 1234n);
            assert.isTrue(1234n >= 1233n);
            assert.isTrue(1234n > 123n);
        }
    },
    {
        name: "Compare signed BigInt literal",
        body: function () {
            assert.isTrue(-123n == -123n);
            assert.isFalse(-123n < -1234n);
            assert.isTrue(-123n > -1234n);
            assert.isFalse(-123n == -1234n);
            assert.isFalse(-1234n >= -1233n);
            assert.isFalse(-1234n > -123n);
            assert.isTrue(123n > -1n);
            assert.isTrue(-1n > -123456789012n);
        }
    },
    {
        name: "Compare zero BigInt literal",
        body: function () {
            assert.isTrue(0n == -0n);
            assert.isTrue(-123n < -0n);
            assert.isTrue(-0n > -1234n);
            assert.isTrue(-0n <= 123n);
            assert.isFalse(0n >= 1233n);
            assert.isTrue(0n > -123n);
            assert.isTrue(0n > -1n);
            assert.isTrue(0n > -123456789012n);
        }
    },
    {
        name: "Init BigInt literal and compare",
        body: function () {
            var x = 12345678901234567890n;
            var y = 12345678901234567891n;
            assert.isFalse(x == y);
            assert.isTrue(x < y);
            assert.isTrue(x <= y);
            assert.isTrue(x == x);
            assert.isFalse(x >= y);
            assert.isFalse(x > y);
        }
    },
    {
        name: "Init BigInt Object and compare",
        body: function () {
            var x = BigInt(12345678901234567890n);
            var y = BigInt(12345678901234567891n);
            assert.isFalse(x == y);
            assert.isTrue(x < y);
            assert.isTrue(x <= y);
            assert.isTrue(x == x);
            assert.isFalse(x >= y);
            assert.isFalse(x > y);
        }
    },
    {
        name: "Out of 64 bit range",
        body: function () {
            var x = 1234567890123456789012345678901234567890n;
            var y = BigInt(1234567890123456789012345678901234567891n);
            assert.isFalse(x == y);
            assert.isTrue(x < y);
            assert.isTrue(x <= y);
            assert.isTrue(x == x);
            assert.isFalse(x >= y);
            assert.isFalse(x > y);
        }
    },
    {
        name: "Very big BigInt, test resize",
        body: function () {
            var x = eval('1234567890'.repeat(20) + 'n');
            var y = eval('1234567891'.repeat(20) + 'n');
            assert.isFalse(x == y);
            assert.isTrue(x < y);
            assert.isTrue(x <= y);
            assert.isTrue(x == x);
            assert.isFalse(x >= y);
            assert.isFalse(x > y);
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
