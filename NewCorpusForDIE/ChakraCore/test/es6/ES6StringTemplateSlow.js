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
        name: "Octal escape sequences are not allowed in string template literals - exhaustive test",
        body: function() {
            function verifyOctalThrows(octalNumber) {
                if (octalNumber < 10) {
                    assert.throws(function () { eval('print(`\\00' + octalNumber + '`)'); }, SyntaxError, "Scanning an octal escape sequence " + "`\\00" + octalNumber + "` throws SyntaxError.", "Octal numeric literals and escape characters not allowed in strict mode");
                }
                if (octalNumber < 100) {
                    assert.throws(function () { eval('print(`\\0' + octalNumber + '`)'); }, SyntaxError, "Scanning an octal escape sequence " + "`\\0" + octalNumber + "` throws SyntaxError.", "Octal numeric literals and escape characters not allowed in strict mode");
                }
                assert.throws(function () { eval('print(`\\' + octalNumber + '`)'); }, SyntaxError, "Scanning an octal escape sequence " + "`\\" + octalNumber + "` throws SyntaxError.", "Octal numeric literals and escape characters not allowed in strict mode");
            }
            for (var i = 1; i <= 255; i++) {
                verifyOctalThrows(i.toString(8));
            }
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
