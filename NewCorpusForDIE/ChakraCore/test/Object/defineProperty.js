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

function TestDefineProperty(desc, testName) {
    WScript.Echo(testName);
    CatchAndWriteExceptions(function () {
        Object.defineProperty(new Object(), "foo", desc);
        WScript.Echo("Success");
    });
}

function CatchAndWriteExceptions(func) {
    try {
        func();
    }
    catch (e) {
        WScript.Echo(e.name + ": " + e.number);
    }
}

var bools = [true, false];
var boolsExtended = [true, false];
boolsExtended[2] = undefined;  // Work around WOOB 1099317 in compat mode

var desc;

for (var includeValue in bools) {
    for (var includeWritable in boolsExtended) {
        for (var includeGetter in bools) {
            for (var includeSetter in bools) {
                var s = "";
                var b;
                desc = {};

                b = bools[includeValue];
                if (b) { desc.value = "fooValue"; s += "value; "; }

                b = boolsExtended[includeWritable];
                if (b !== undefined) { desc.writable = b; s += "writable=" + b + "; "; }

                b = bools[includeGetter];
                if (b) { desc.get = function () { return "aValue"; }; s += "getter; "; }

                b = bools[includeSetter];
                if (b) { desc.set = function (v) { }; s += "setter; "; }

                TestDefineProperty(desc, s);
            }
        }
    }
}
