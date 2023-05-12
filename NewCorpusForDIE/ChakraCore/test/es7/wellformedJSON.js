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
        name: "Broken surrogate pairs should be escaped during JSON.stringify",
        body: function () {
            assert.areEqual(JSON.stringify("\uD834"), '"\\ud834"',
              'JSON.stringify("\\uD834")');
            assert.areEqual(JSON.stringify("\uDF06"), '"\\udf06"',
              'JSON.stringify("\\uDF06")');

            assert.areEqual(JSON.stringify("\uD834\uDF06"), '"𝌆"',
              'JSON.stringify("\\uD834\\uDF06")');
            assert.areEqual(JSON.stringify("\uD834\uD834\uDF06\uD834"), '"\\ud834𝌆\\ud834"',
              'JSON.stringify("\\uD834\\uD834\\uDF06\\uD834")');
            assert.areEqual(JSON.stringify("\uD834\uD834\uDF06\uDF06"), '"\\ud834𝌆\\udf06"',
              'JSON.stringify("\\uD834\\uD834\\uDF06\\uDF06")');
            assert.areEqual(JSON.stringify("\uDF06\uD834\uDF06\uD834"), '"\\udf06𝌆\\ud834"',
              'JSON.stringify("\\uDF06\\uD834\\uDF06\\uD834")');
            assert.areEqual(JSON.stringify("\uDF06\uD834\uDF06\uDF06"), '"\\udf06𝌆\\udf06"',
              'JSON.stringify("\\uDF06\\uD834\\uDF06\\uDF06")');

            assert.areEqual(JSON.stringify("\uDF06\uD834"), '"\\udf06\\ud834"',
              'JSON.stringify("\\uDF06\\uD834")');
            assert.areEqual(JSON.stringify("\uD834\uDF06\uD834\uD834"), '"𝌆\\ud834\\ud834"',
              'JSON.stringify("\\uD834\\uDF06\\uD834\\uD834")');
            assert.areEqual(JSON.stringify("\uD834\uDF06\uD834\uDF06"), '"𝌆𝌆"',
              'JSON.stringify("\\uD834\\uDF06\\uD834\\uDF06")');
            assert.areEqual(JSON.stringify("\uDF06\uDF06\uD834\uD834"), '"\\udf06\\udf06\\ud834\\ud834"',
              'JSON.stringify("\\uDF06\\uDF06\\uD834\\uD834")');
            assert.areEqual(JSON.stringify("\uDF06\uDF06\uD834\uDF06"), '"\\udf06\\udf06𝌆"',
              'JSON.stringify("\\uDF06\\uDF06\\uD834\\uDF06")');
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
