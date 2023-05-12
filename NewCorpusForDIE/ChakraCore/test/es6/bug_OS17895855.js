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
        name: "Concise-body lambda function containing in expression",
        body: function () {
            var l = a => '0' in [123]
            assert.areEqual("a => '0' in [123]", l.toString(), "consise-body lambda containing in expression");
            assert.isTrue(l(), "in expression can be the concise-body lambda body");
        }
    },
    {
        name: "Concise-body lambda function as var decl initializer in a for..in loop",
        body: function () {
            for (var a = () => 'pass' in []) {
                assert.fail("Should not enter for loop since [] has no properties");
            }
            assert.areEqual('pass', a(), "var decl from for loop should have initialized a");

            for (var a2 = () => 'pass' in [123]) {
                assert.areEqual('0', a2, "Should enter the for loop with property '0'");
            }
            assert.areEqual('0', a2, "var decl from for loop should have been assigned to during iteration");
        }
    },
    {
        name: "Concise-body lambda function as var decl initializer in a for..in..in loop",
        body: function () {
            for (var b = () => 'pass' in [] in []) {
              assert.fail("Should not enter for loop");
            }
            assert.areEqual('pass', b(), "var decl from for loop should still have initial value");

            for (var b2 = () => 'pass' in '0' in [123]) {
              assert.fail("var decl initialization turns into var b2 = () => 'pass' in true which should not enter this loop");
            }
            assert.areEqual('pass', b2(), "var decl was not overriden inside the for loop");
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
