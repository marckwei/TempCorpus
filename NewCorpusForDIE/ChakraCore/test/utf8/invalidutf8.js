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

// !!!! DO NOT EDIT THIS FILE WITH A NORMAL TEXT EDITOR !!!

// This file contains invalid UTF8 sequences that any sane editor would "fix".
// but would, however break this test. If you do edit it then make sure the invalid
// sequences are retained in the edited file before checking in.

function write(a) {
    if (this.WScript == undefined) {
        document.write(a);
        document.write("</br>");
    }
    else
        WScript.Echo(a)
}

function test(a, b) {
  write(a == b);
  var evalText = "result = \"" + a + "\"";
  eval(evalText);
  write(a == result);
}
  
// String containing invalid sequence C0 20 should be equivient to \uFFFD\u00020"
var C020 = "� ";
var Rep20 = "\uFFFD\u0020";
test(C020, Rep20);

// Ensure a valid sequence gets translated correctly.
var C885 = "ȅ";
var x0205 = "\u0205";
test(C885, x0205);

// Ensure surrogate pairs are encoded correctly
var F0909080 = "𐐀";
var D801DC00 = "\uD801\uDC00";
test(F0909080, D801DC00);

// Ensure invalid surrogate pairs are replaced with replacement characters.
var EDA081_EDB080 = "������";
var Repx6 = "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD";
test(EDA081_EDB080, Repx6);

// Ensure invalid characters are not replaced with replacement characters.
var EFBFBF = "￿";
var Repx7 = "\uFFFF";
test(EFBFBF, Repx7);
