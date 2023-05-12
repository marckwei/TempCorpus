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

var obj = { a: 1, b: 2, c:3 };
var obj2 = { d: 1, e: 2, f:3 };
var obj3 = { g: 1, h: 2, i:3 };
var obj4 = { j: 1, k: 2, l:3 };

var inlinee = function() { return ""; };
function func(obj, obj2, obj3, obj4)
{
    for (var s in obj) {
        WScript.Echo("outter " + s);
        forin_inlinee(obj2, obj3);
    }
    forin4(obj, obj2, obj3, obj4);
}

function forin_inlinee(obj2, obj3)
{
    for (var s in obj2) {
        WScript.Echo("inner " + s);
        forin_inlinee2(obj3);
    }
}
function forin_inlinee2(obj3)
{
    for (var s in obj3) {
        WScript.Echo("inner3 " + s);
    }
}

function forin4(obj, obj2, obj3, obj4)
{
    for (var s in obj) {
        for (var s1 in obj2) {
            for (var s2 in obj3) {
                for (var s3 in obj4) {
                    WScript.Echo(inlinee() + s + s1 + s2 + s3);
                }
            }
        }
    }
}

func(obj, obj2, obj3, obj4);
func(obj, obj2, obj3, obj4);
func(obj, obj2, obj3, obj4);
inlinee = function() { return " "; } // force a bailout
func(obj, obj2, obj3, obj4);


