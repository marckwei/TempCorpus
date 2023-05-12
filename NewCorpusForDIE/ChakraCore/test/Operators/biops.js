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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function write(v) {
    v = (v + "").replace(/\(PST\)/g, "(Pacific Standard Time)")
                .replace(/\(PDT\)/g, "(Pacific Daylight Time)");

    WScript.Echo(v);
}

function foo() {}
var d = new Date("Thu Aug 5 05:30:00 PDT 2010");

var all = [ undefined, null,
            true, false,
            Boolean(true), Boolean(false),
            new Boolean(true), new Boolean(false),
            NaN, +0, -0, 0, 0.0, -0.0, +0.0,
            1, 10, 10.0, 10.1, -1, 
            -10, -10.0, -10.1,
            Number.MAX_VALUE, Number.MIN_VALUE, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY,
            new Number(NaN), new Number(+0), new Number(-0), new Number(0), 
            new Number(0.0), new Number(-0.0), new Number(+0.0), 
            new Number(1), new Number(10), new Number(10.0), new Number(10.1), new Number(-1), 
            new Number(-10), new Number(-10.0), new Number(-10.1),
            new Number(Number.MAX_VALUE), new Number(Number.MIN_VALUE), new Number(Number.NaN), 
            new Number(Number.POSITIVE_INFINITY), new Number(Number.NEGATIVE_INFINITY),
            "", "0xa", "04", "hello", "hel" + "lo",
            String(""), String("hello"), String("h" + "ello"),
            new String(""), new String("hello"), new String("he" + "llo"),
            new Object(), new Object(),
            [1,2,3], [1,2,3],
            new Array(3), Array(3), new Array(1, 2, 3), Array(1),
            foo, d, 1281011400000, d
          ];

var biops = [    
    "*", "/", "%",                // 11.5 Multiplicative operators    
    "+", "-",                     // 11.6 Addtitive operators
    "<<", ">>", ">>>",            // 11.7 Bitwise shift operators
    "<", ">", "<=", ">=",         // 11.8 Relational operators
    "==", "!=", "===", "!==",     // 11.9 Equality operators
    "&", "^", "|",                // 11.10 Binary bitwise operators
    "&&", "||"                    // 11.11 Binary logical operators    
];

for (var op in biops) {
    for (var i=0; i<all.length; ++i) {
        for (var j=0; j<all.length; ++j) {
            write("a["+i+"]("+all[i]+") "+biops[op]+" a["+j+"]("+all[j]+") = " + eval("all[i] " + biops[op] + " all[j];"));            
        }
    }
}
