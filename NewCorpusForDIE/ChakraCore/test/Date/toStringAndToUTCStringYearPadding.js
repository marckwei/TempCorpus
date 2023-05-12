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

// For dates whose years are less than 1000, Date.toString() and Date.toUTCString() should pad the years
// to 4 digits.
// See https://github.com/Microsoft/ChakraCore/pull/4067

/// <reference path="../UnitTestFramework/UnitTestFramework.js" />
if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

function testDate(DateObj, toStringExpected, toUTCStringExpected) {
    assert.areEqual(toStringExpected, DateObj.toString(), "Date.toString() returns invalid value.");
    assert.areEqual(toUTCStringExpected, DateObj.toUTCString(), "Date.toUTCString() returns invalid value.");
}

let tests = [{
    name: "test if Date.toString() and Date.toUTCString() pad positive years to four digits",
    body: function () {
        testDate(new Date("0001-10-13T05:16:33Z"), "Fri Oct 12 0001 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Sat, 13 Oct 0001 05:16:33 GMT");
        testDate(new Date("0011-10-13T05:16:33Z"), "Wed Oct 12 0011 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Thu, 13 Oct 0011 05:16:33 GMT");
        testDate(new Date("0111-10-13T05:16:33Z"), "Mon Oct 12 0111 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Tue, 13 Oct 0111 05:16:33 GMT");
        testDate(new Date("1111-10-13T05:16:33Z"), "Thu Oct 12 1111 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Fri, 13 Oct 1111 05:16:33 GMT");
    }
},
{
    name: "test if Date.toString() and Date.toUTCString() pad negative years to four digits",
    body: function () {
        testDate(new Date("-000001-10-13T05:16:33Z"), "Tue Oct 12 -0001 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Wed, 13 Oct -0001 05:16:33 GMT");
        testDate(new Date("-000011-10-13T05:16:33Z"), "Thu Oct 12 -0011 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Fri, 13 Oct -0011 05:16:33 GMT");
        testDate(new Date("-000111-10-13T05:16:33Z"), "Sat Oct 12 -0111 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Sun, 13 Oct -0111 05:16:33 GMT");
        testDate(new Date("-001111-10-13T05:16:33Z"), "Wed Oct 12 -1111 22:16:33 GMT-0700 (Pacific Daylight Time)",
            "Thu, 13 Oct -1111 05:16:33 GMT");
    }
}];

testRunner.run(tests, { verbose: WScript.Arguments[0] != "summary" });
