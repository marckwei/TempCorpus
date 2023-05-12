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

// Date.parse must be able to parse the strings returned by Date.toUTCString() and Date.toISOString()
// for negative and zero-padded years.
// See https://github.com/Microsoft/ChakraCore/pull/4318

/// <reference path="../UnitTestFramework/UnitTestFramework.js" />
if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

function testDate(isoDateString) {
    let Dateobj = new Date(isoDateString);
    let value = Dateobj.valueOf();
    let UTCstr = Dateobj.toUTCString();
    let ISOstr = Dateobj.toISOString();

    assert.areEqual(value, Date.parse(UTCstr), "Date.parse('" + UTCstr + "') returns wrong value.");
    assert.areEqual(value, Date.parse(ISOstr), "Date.parse('" + ISOstr + "') returns wrong value.");
}

let tests = [{
    name: "test if Date.parse() can correctly parse outputs of Date.toUTCString() and Date.toISOString()",
    body: function () {
        testDate("0001-10-13T05:16:33Z");
        testDate("0011-10-13T05:16:33Z");
        testDate("0111-10-13T05:16:33Z");
        testDate("1111-10-13T05:16:33Z");

        // test BC years
        testDate("-000001-11-13T19:40:33Z");
        testDate("-000011-11-13T19:40:33Z");
        testDate("-000111-11-13T19:40:33Z");
        testDate("-001111-11-13T19:40:33Z");
    }
}];

testRunner.run(tests, { verbose: WScript.Arguments[0] != "summary" });
