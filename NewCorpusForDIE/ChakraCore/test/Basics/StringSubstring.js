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

function test(x, s, e)
{
    var result = x.substring(s, e);
    WScript.Echo('"' + result + '", length:', result.length);
}

//
// Test regular strings
//

var left = "abcdefghijklmnopqrstuvwxyz";
test(left, 1, 10);
test(left, 0, 5);
test(left, 15, 25);

//
// Test concatenated strings
//

var right = "1234567890";
var c = left + right;

WScript.Echo("Left-only");
test(c, 1, 10);
test(c, 0, 5);
test(c, 15, 25);
WScript.Echo();

WScript.Echo("Right-only");
var o = left.length;
test(c, o + 1, o + 5);
test(c, o, o + 10);
WScript.Echo();

WScript.Echo("Split");
test(c, o - 2, o + 3);
test(c, 0, c.length);
WScript.Echo();

//
// Test parameter validation
//

WScript.Echo("Split");
test(left, 3);  // To end of string
test(left, 0, 0);
test(left, 0, 1);
