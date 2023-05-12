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

function DumpArray(a)
{
    var undef_start = -1;
    for (var i = 0; i < a.length; i++)
    {
        if (a[i] == undefined)
        {
            if (undef_start == -1)
            {
                undef_start = i;
            }
        }
        else
        {
            if (undef_start != -1)
            {
                WScript.Echo(undef_start + "-" + (i-1) + " = undefined");
                undef_start = -1;
            }
            WScript.Echo(i + " = " + a[i]);
        }
    }
}
DumpArray([]);
DumpArray([ 0 ]);
DumpArray([ 0, 1, 2, 3, 4, 5, 6 ,7 ,8, 9]);
DumpArray([,,,0,,,1,,,2,,,3,,,4,,,5,,,6,,,7,,,8,,,9,,,]);

var s0 = "";
for (var i = 0; i < 100; i++)
{
    s0 += ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,";
}
DumpArray(eval("[" + s0 + "1]"));
var s1 = "";
for (var i = 0; i < 30; i++)
{
    s1 += s0;
}
DumpArray(eval("[" + s1 + "1]"));
var s2 = "";
for (var i = 0; i < 10; i++)
{
    s2 += s1;
}
DumpArray(eval("[" + s2 + "1]"));

