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

var a = new Array(10);
var b = new Array();
var c = new Array("muck", 3.2, 0, 18);
c[-1] = "minus 1";

WScript.Echo("Store a single item in a");
a[1] = 10;
WScript.Echo(a[1]);

WScript.Echo("Store a single item in b");
b[3] = 99;
WScript.Echo(b[3]);

for (var i = -1; i < c.length; i++) {
    WScript.Echo(c[i]);
}

// Test boolean expressions in an initializer
var x = {}, y = false;
WScript.Echo([x||y]);
WScript.Echo([x&&y]);
WScript.Echo([x ? y : x]);
WScript.Echo([y ? x : y]);
WScript.Echo([y||x]);
WScript.Echo(y&&x);
WScript.Echo([x||y, x&&y, x ? y : x, y ? x : y, y||x, y&&x]);

// Test some boundary property names
var o = [];

o["4294967294"] = 100;
WScript.Echo(o["4294967294"]);

o["4294967295"] = 101;
WScript.Echo(o["4294967295"]);

o["4294967296"] = 102;
WScript.Echo(o["4294967296"]);

o["4088701331"] = 103;
WScript.Echo(o["4088701331"]);

o["40887013312"] = 104;
WScript.Echo(o["40887013312"]);

o["4088.7013"] = 105;
WScript.Echo(o["4088.7013"]);

o["408870133X"] = 106;
WScript.Echo(o["408870133X"]);
