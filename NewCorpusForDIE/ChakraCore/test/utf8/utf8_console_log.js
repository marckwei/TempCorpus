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

// 1b: U+0041 (A) Uppercase Latin A
// 2b: U+00A1 (¡) inverted exclamation mark
// 2b: U+0101 (ā) LATIN SMALL LETTER A WITH MACRON
// 3b: U+2014 (—) em dash
// 4b: U+10401 Deseret Long E -- surrogate pair \uD801\uDC01

const A         = "\u0041";    // U+0041 (ASCII); UTF-16 0x0041       ; UTF-8 0x41
const iexcl     = "\u00A1";    // U+00A1        ; UTF-16 0x00A1       ; UTF-8 0xC2 0xA0
const amacron   = "\u0101";    // U+0101        ; UTF-16 0x0101       ; UTF-8 0xC4 0x81
const emdash    = "\u2014";    // U+2014        ; UTF-16 0x2014       ; UTF-8 0xE2 0x80 0x94
const desLongE  = "\u{10401}"; // U+10401       ; UTF-16 0xD801 0xDC01; UTF-8 0xF0 0x90 0x90 0x81

console.log(`${A} ${iexcl} ${amacron} ${emdash} ${desLongE}`);
console.log("русский 中文");
