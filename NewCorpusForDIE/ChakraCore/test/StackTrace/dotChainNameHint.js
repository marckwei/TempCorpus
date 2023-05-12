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

if (typeof (WScript) != "undefined") {
    WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    {
        name: "OS#14711878: Throw SOE (not crash) in Parser::ConstructNameHint (OSS-Fuzz test case)",
        body: function ()
        {
            assert.throws(function () {
                // This block is derived directly from the OSS-Fuzz test case.
                const M = 1e6;
                var u;
                for (var i = 0; i < M; i++) {
                    u = u + ".prototype";
                }
                eval(u);
            }, Error, "Should throw SOE (not crash with SOE) in Parser::ConstructNameHint", "Out of stack space");
        }
    },
    {
        name: "OS#14711878: Throw SOE (not crash) in Parser::ConstructNameHint (more 'normal' test case)",
        body: function ()
        {
            assert.throws(function () {
                // There is nothing special about the names/patterns used in the above test case.
                // This bug is strictly about SOE caused by stack depth from chaining the dot `.` operator.
                const M = 1e6;
                var u = "foo"; // explicit name
                for (var i = 0; i < M; i++) {
                    u = u + ".a"; // not a special property
                }
                eval(u);
            }, Error, "Should throw SOE (not crash with SOE) in Parser::ConstructNameHint", "Out of stack space");
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
