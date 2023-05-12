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
        name: "Assign BigInt literal",
        body: function () {
            var x = 123n;
            var y = x;
            assert.isTrue(x == 123n);
            assert.isTrue(y == 123n);
            x++;
            assert.isTrue(x == 124n);
            assert.isTrue(y == 123n);
            y = x;
            ++x;
            assert.isTrue(x == 125n);
            assert.isTrue(y == 124n);
        }
    },
    {
        name: "Assign BigInt object",
        body: function () {
            var x = BigInt(123n);
            var y = x;
            assert.isTrue(x == 123n);
            assert.isTrue(y == 123n);
            x++;
            assert.isTrue(x == 124n);
            assert.isTrue(y == 123n);
            y = x;
            ++x;
            assert.isTrue(x == 125n);
            assert.isTrue(y == 124n);
        }
    },
    {
        name: "Value change with add and sub",
        body: function () {
            var x = BigInt(123n);
            var y = x;
            assert.isTrue(x == 123n);
            assert.isTrue(y == 123n);
            x = x + 2n;
            assert.isTrue(x == 125n);
            assert.isTrue(y == 123n);
            y = x;
            x = x - 2n;
            assert.isTrue(x == 123n);
            assert.isTrue(y == 125n);
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
