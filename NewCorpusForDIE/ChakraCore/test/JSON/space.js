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

if (this.WScript && this.WScript.LoadScriptFile) { // works for browser
    WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
{
    name: "regress Win8: 690708",
    body: function () {

        function stringify(o, space) {
            var str = JSON.stringify(o, null, space);
            var str2 = JSON.stringify(o, null, new Number(space)); // Test Number Object

            helpers.writeln("--space: " + space);
            helpers.writeln(str);
            assert.areEqual(str, str2);
        }
        
        var o = { ab: 123 };
        var spaces = [
            Number.MIN_VALUE,
            -4294967296,
            -2147483649,
            -2147483648, //int32 min
            -1073741825,
            -1073741824, //int31 min
            -28, -7, -1, 0, 1, 6, 15,
            1073741823, //int31 max
            1073741824,
            2147483647, //int32 max
            2147483647.1,
            2147483648,
            2147483648.2,
            4294967295, //uint32 max
            4294967296,
            Number.MAX_VALUE
        ];
        spaces.forEach(function (space) {
            stringify(o, space);
        });
    }
}
];

testRunner.run(tests);