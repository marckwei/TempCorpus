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

// //-------------------------------------------------------------------------------------------------------
// // Copyright (C) Microsoft. All rights reserved.
// // Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
// //-------------------------------------------------------------------------------------------------------
WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "plain recursive call with modified arguments",
        body: function () {
            function recursive(a) {
                recursive(a + 1);
            }
            try {
                recursive(42);
                assert(false); // should never reach this line
            }
            catch (e) {
                assert.areNotEqual(-1, e.message.indexOf("Out of stack space"), "Should be SO exception");
            }
        }
    },
    {
        name: "plain recursive call with no arguments",
        body: function () {
            function recursive() {
                recursive();
            }
            try {
                recursive();
                assert(false); // should never reach this line
            }
            catch (e) {
                assert.areNotEqual(-1, e.message.indexOf("Out of stack space"), "Should be SO exception");
            }
        }
    },
    {
        name: "recursive call to getter via proxy",
        body: function () {
            var obj = {};
            var handler = {
                get: function () {
                    return obj.x;
                }
            };
            obj = new Proxy(obj, handler);

            try {
                var y = obj.x;
                assert(false); // should never reach this line
            }
            catch (e) {
                assert.areNotEqual(-1, e.message.indexOf("Out of stack space"), "Should be SO exception");
            }
        }
    },
];
 
testRunner.runTests(tests, { verbose: false /*so no need to provide baseline*/ });
