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

// This test cases test if a string that is UTF-8 encoded string with surrogate code units encoded as 3 bytes UTF8 characters prints correctly or not.
// For this test case to work, please save this file with UTF-8 encoding
var y = "function () { 'চ𐌲𐌿𐍄𐌹𐍃𐌺নির্বাচিত নিবন্ধ।' ;WScript.Echo('hello'); }"
var x = function () { 'চ𐌲𐌿𐍄𐌹𐍃𐌺নির্বাচিত নিবন্ধ।' ;WScript.Echo('hello'); }

// 2 bytes 
var y2 = "function () { 'üç kuğu' ;WScript.Echo('hello'); }" 
var x2 = function () { 'üç kuğu' ;WScript.Echo('hello'); } 

WScript.Echo((x.toString() === y && x2.toString() === y2) ? "PASS" : "FAIL");