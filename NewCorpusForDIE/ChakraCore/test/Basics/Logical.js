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

var x = 0;
var y = 1;

var z = x && WScript.Echo("Should have short-circuited '&&' (1)");
WScript.Echo("z == " + z + " (2)");
z = y || WScript.Echo("Should have short-circuited '||' (3)");
WScript.Echo("z == " + z + " (4)");

z = y && WScript.Echo("z == " + z + " (5)");
z = x || WScript.Echo("z == " + z + " (6)");

z = 1;
if (x || !(z = 0)) {
    WScript.Echo("z == " + z + " (7)");
}

z = 2;
if (y && !(z = 0)) {
    WScript.Echo("z == " + z + " (8)");
}

z = 0;
if (!y && (z = 3)) {
    WScript.Echo("Should not be here (9)");
}
WScript.Echo("z == " + z + " (10)");

z = 0;
if (!x || (z = 4)) {
    WScript.Echo("z == " + z + " (11)");
}

