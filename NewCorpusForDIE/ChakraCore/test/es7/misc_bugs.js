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
        name: "Inner function of 'async' function has default - should not throw any assert",
        body: function () {
            assert.doesNotThrow(function () { eval(`async function f1() {
                   function foo(a = function() { } ) { }; 
            }`); });

            assert.doesNotThrow(function () { eval(`var f1 = async ( ) => {
                   function foo(a = function() { } ) { } };`); });
                   
            assert.doesNotThrow(function () { eval(`async function f1() {
                        function foo() {
                            async function f2() {
                                function bar (a = function () {} ) {
                                }
                            }
                        }
                    }`); });
        }
    },
    {
        name: "Await in class body should not crash",
        body: function () {
            async function trigger() {
                a=class b{
                    [a = class b{
                        [await 0](){}
                    }](){}
                };
            }

            trigger();
        }
    },

];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
