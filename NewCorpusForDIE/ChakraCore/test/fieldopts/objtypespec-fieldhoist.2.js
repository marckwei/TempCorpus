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

// Windows Blue Bug 146740
// Run with -maxInterpretCount:1
// When hoisting a field load or store would hoist the associated type check as well.  However, this type check may
// be protecting other fields operations that are not hoistable, and would then be executed without the required type
// check.  Here the field load of exhxkm (for ++exhxkm) ostensibly checked the type of the global object and produced
// a type value, which was then consumed by uiktzz++, but when copy prop replaced the load of exhxkm, the type check
// got removed as well.
x = this;
Object.prototype["uiktzz"] = function uiktzz() {}

function test() {
    for (exhxkm = 0; exhxkm < 3; ++exhxkm) {
        if (exhxkm == 1) {
            (delete x.uiktzz);
        } else {
            uiktzz++;
        }
    };
    return x;
};

// Interpreter call
test();

// JIT call
test();
test();
test();
WScript.Echo(uiktzz);
WScript.Echo(this.x.uiktzz);
