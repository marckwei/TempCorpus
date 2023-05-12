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

if (this.WScript && this.WScript.LoadScriptFile) {
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    {
        name: "'let' should not be an allowed name in let declarations",
        body: function() {
            assert.throws(function () { eval("let test = 2, let = 1;"), SyntaxError, "'let' is not an allowed identifier in lexical declarations" });
        }
    },
    {
        name: "'let' should not be an allowed name in const declarations",
        body: function () {
            assert.throws(function () { eval("const let = 1, test = 2;"), SyntaxError, "'let' is not an allowed identifier in lexical declarations" });
        }
    },
    {
        name: "'let' should not be an allowed name in destructuring let declarations",
        body: function () {
            assert.throws(function () { eval("let [a, let, b] = [1, 2, 3];"), SyntaxError, "'let' is not an allowed identifier in lexical declarations" });
        }
    },
    {
        name: "'let' should not be an allowed name in destructuring const declarations",
        body: function () {
            assert.throws(function () { eval("const [a, let, b] = [1, 2, 3];"), SyntaxError, "'let' is not an allowed identifier in lexical declarations" });
        }
    },
    {
        name: "'let' should not be an allowed name in 'for(let .. in ..)' declarations",
        body: function () {
            assert.throws(function () { eval("for(let let in { }) { };"), SyntaxError, "'let' is not an allowed identifier in lexical declarations" });
        }
    },
    {
        name: "'let' is OK if used in var declarations",
        body: function () { var let = 1, test = 2; }
    },
]

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
