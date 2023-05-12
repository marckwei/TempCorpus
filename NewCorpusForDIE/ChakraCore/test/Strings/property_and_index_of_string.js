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

// Number tests

if (this.WScript && this.WScript.LoadScriptFile)
{ // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = 
[
    {
        name: "Assignment to a property on a string without a setter in sloppy mode should be ignored",
        body: function ()
        {
            var str = "x";
            str.a = 12;
            assert.areEqual(undefined, str.a);
        }
    },
    {
        name: "Assignment to a property on a string without a setter in strict mode should throw an error",
        body: function ()
        {
            var str = "x";
            assert.throws(function() { "use strict"; str.a = 1; }, TypeError, "Assigning to a property of a number should throw a TypeError.", "Assignment to read-only properties is not allowed in strict mode");
        }
    },
    {
        name: "Assignment to a property on a string without a setter in sloppy mode should be ignored",
        body: function ()
        {
            var str = "x";
            str['a'] = 12;
            assert.areEqual(undefined, str.a);
        }
    },
    {
        name: "Assignment to a property on a string without a setter in strict mode should throw an error",
        body: function ()
        {
            var str = "x";
            assert.throws(function() { "use strict"; str['a'] = 1; }, TypeError, "Assigning to a property of a number should throw a TypeError.", "Assignment to read-only properties is not allowed in strict mode");
        }
    },
    {
        name: "Assignment to an index on a string without a setter in sloppy mode should be ignored",
        body: function ()
        {
            var str = "x";
            str[66] = 12;
            assert.areEqual(undefined, str.a);
        }
    },
    {
        name: "Assignment to an index on a string without a setter in strict mode should throw an error",
        body: function ()
        {
            var str = "x";
            assert.throws(function() { "use strict"; str[66] = 1; }, TypeError, "Assigning to a property of a number should throw a TypeError.", "Assignment to read-only properties is not allowed in strict mode");
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
