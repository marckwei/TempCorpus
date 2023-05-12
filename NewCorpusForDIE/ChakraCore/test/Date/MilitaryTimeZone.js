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

// See: https://github.com/Microsoft/ChakraCore/pull/4016
// Test interpretation of military time zone
runTest("2011-11-08 19:48:43a", "2011-11-08T19:48:43.000+01:00");
runTest("2011-11-08 19:48:43 a", "2011-11-08T19:48:43.000+01:00");
runTest("2011-11-08 19:48:43 b", "2011-11-08T19:48:43.000+02:00");
runTest("2011-11-08 19:48:43 c", "2011-11-08T19:48:43.000+03:00");
runTest("2011-11-08 19:48:43 d", "2011-11-08T19:48:43.000+04:00");
runTest("2011-11-08 19:48:43 e", "2011-11-08T19:48:43.000+05:00");
runTest("2011-11-08 19:48:43 f", "2011-11-08T19:48:43.000+06:00");
runTest("2011-11-08 19:48:43 g", "2011-11-08T19:48:43.000+07:00");
runTest("2011-11-08 19:48:43 h", "2011-11-08T19:48:43.000+08:00");
runTest("2011-11-08 19:48:43 i", "2011-11-08T19:48:43.000+09:00");
runTest("2011-11-08 19:48:43 j", null);
runTest("2011-11-08 19:48:43 k", "2011-11-08T19:48:43.000+10:00");
runTest("2011-11-08 19:48:43 l", "2011-11-08T19:48:43.000+11:00");
runTest("2011-11-08 19:48:43 m", "2011-11-08T19:48:43.000+12:00");
runTest("2011-11-08 19:48:43 n", "2011-11-08T19:48:43.000-01:00");
runTest("2011-11-08 19:48:43 o", "2011-11-08T19:48:43.000-02:00");
runTest("2011-11-08 19:48:43 p", "2011-11-08T19:48:43.000-03:00");
runTest("2011-11-08 19:48:43 q", "2011-11-08T19:48:43.000-04:00");
runTest("2011-11-08 19:48:43 r", "2011-11-08T19:48:43.000-05:00");
runTest("2011-11-08 19:48:43 s", "2011-11-08T19:48:43.000-06:00");
runTest("2011-11-08 19:48:43 t", "2011-11-08T19:48:43.000-07:00");
runTest("2011-11-08 19:48:43 u", "2011-11-08T19:48:43.000-08:00");
runTest("2011-11-08 19:48:43 v", "2011-11-08T19:48:43.000-09:00");
runTest("2011-11-08 19:48:43 w", "2011-11-08T19:48:43.000-10:00");
runTest("2011-11-08 19:48:43 x", "2011-11-08T19:48:43.000-11:00");
runTest("2011-11-08 19:48:43 y", "2011-11-08T19:48:43.000-12:00");
runTest("2011-11-08 19:48:43 z", "2011-11-08T19:48:43.000Z");

function runTest(dateToTest, isoDate) {
    if (isoDate === null) {
        if (isNaN(Date.parse(dateToTest))) {
            console.log("PASS");
        } else {
            console.log("Wrong date parsing result: Date.parse(\"" + dateToTest + "\") should return NaN");
        }
    } else {
        if (Date.parse(dateToTest) === Date.parse(isoDate)) {
            console.log("PASS");
        } else {
            console.log("Wrong date parsing result: Date.parse(\"" + dateToTest + "\") should equal Date.parse(\"" + isoDate + "\")");
        }
    }
}
