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

﻿//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

//                   000000000111111111122222222223333333333444444444455555555556666666666777777777788888888889
//                   123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
var expectedError = "Error: aİc\n\tat aTurkish (bug_258259.js:12:5)\n\tat Global code (bug_258259.js:34:9)";

//-- Turkish 'i' character in error message and file name
function aTurkish() {
    throw Error("aİc");
}

function filterFullFilePathFromCallstack(cs) {
    var filteredStack = cs;
    var fileName = "bug_258259.js:";
    var startDelim = " (";

    // remove full path from the file name in the call stack (x2)
    var lastInd = filteredStack.lastIndexOf(fileName);
    var firstInd = filteredStack.lastIndexOf(startDelim, lastInd);
    filteredStack = filteredStack.substring(0, firstInd + startDelim.length) + filteredStack.substring(lastInd);

    lastInd = filteredStack.lastIndexOf(fileName);
    lastInd = filteredStack.lastIndexOf(fileName, lastInd - 1);
    firstInd = filteredStack.lastIndexOf(startDelim, lastInd);
    filteredStack = filteredStack.substring(0, firstInd + startDelim.length) + filteredStack.substring(lastInd);

    return filteredStack;
}

try {
        aTurkish();
} catch (ex) {
    var filteredStack = filterFullFilePathFromCallstack([ex.stack].toString());

    if (filteredStack == expectedError) {
        WScript.Echo("PASS");
    } else {
        WScript.Echo("FAILED");
        WScript.Echo("\nActual (raw):\n" + [ex.stack]);
        WScript.Echo("\nActual (filtered):\n" + filteredStack);
        WScript.Echo("\n\nExpected:\n" + expectedError);
    }
}
