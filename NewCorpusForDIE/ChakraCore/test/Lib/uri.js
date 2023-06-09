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

// Ranges of valid hexadecimal characters
var v0 = 48, v9 = 57, vA = 65, vZ = 90, va = 97, vz = 122;

var nonHexWideCharValues =
[
    // These characters are just outside the boundaries for hexadecimal characters
    v0 - 1, v9 + 1,
    vA - 1, vZ + 1,
    va - 1, vz + 1,

    // Some of these non-ASCII characters may map to a hexadecimal digit. However, we still should not accept them since they
    // are not hexadecimal characters in the ASCII set.
    65296, 65297, 65298, 65299, 65300, 65301, 65302, 65303,
    65304, 65305, 65313, 65314, 65315, 65316, 65317, 65318,
    65345, 65346, 65347, 65348, 65349, 65350
];

writeLine("First character invalid in %-encoded URI component:");
for (var i in nonHexWideCharValues)
{
    var testResult = "    " + nonHexWideCharValues[i] + ": ";
    try
    {
        decodeURIComponent("%" + String.fromCharCode(nonHexWideCharValues[i]) + "0");
        testResult += "Fail (no exception)";
    }
    catch (ex)
    {
        testResult += "Pass (" + ex.name + ": " + ex.message + ")";
    }

    writeLine(testResult);
}
writeLine("");

writeLine("Second character invalid in %-encoded URI component:");
for (var i in nonHexWideCharValues)
{
    var testResult = "    " + nonHexWideCharValues[i] + ": ";
    try
    {
        decodeURIComponent("%0" + String.fromCharCode(nonHexWideCharValues[i]));
        testResult += "Fail (no exception)";
    }
    catch (ex)
    {
        testResult += "Pass (" + ex.name + ": " + ex.message + ")";
    }

    writeLine(testResult);
}
writeLine("");

// Helpers

function writeLine(str)
{
    WScript.Echo("" + str);
}
