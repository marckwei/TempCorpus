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

// Test non-ISO format with milliseconds
// using colon as millisecond separator is not allowed
runTest("2011-11-08 19:48:43:", "2011-11-08T19:48:43.000");  // valid, last colon is ignored
runTest("2011-11-08 19:48:43:1", null);
runTest("2011-11-08 19:48:43:10", null);
runTest("2011-11-08 19:48:43:100", null);

// use dot as millisecond separator
runTest("2011-11-08 19:48:43.", "2011-11-08T19:48:43.000");
runTest("2011-11-08 19:48:43.1", "2011-11-08T19:48:43.100");
runTest("2011-11-08 19:48:43.1 ", "2011-11-08T19:48:43.100");
runTest("2011-11-08 19:48:43. 1", "2011-11-08T19:48:43.100");
runTest("2011-11-08 19:48:43.01", "2011-11-08T19:48:43.010");
runTest("2011-11-08 19:48:43.001", "2011-11-08T19:48:43.001");
runTest("2011-11-08 19:48:43.0001", "2011-11-08T19:48:43.000");
runTest("2011-11-08 19:48:43.00000001", null);  // having more than 7 consecutive digits causes overflow
runTest("2011-11-08 19:48:43.10", "2011-11-08T19:48:43.100");
runTest("2011-11-08 19:48:43.100", "2011-11-08T19:48:43.100");
runTest("2011-11-08 19:48:43.1000", "2011-11-08T19:48:43.100");
runTest("2011-11-08 19:48:43.12345", "2011-11-08T19:48:43.123");

// previously the '+' or '-' would be skipped and the offset interpreted as a time
runTest("2011-11-08+01:00", null);
runTest("2011-11-08-01:00", null);

function runTest(dateToTest, isoDate)
{
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
