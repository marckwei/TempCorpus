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

function assertPropertyExists(o, p, v) {
    if (!o.hasOwnProperty(p)) {
        throw new Error("Object does not have expected property '" + p + "'");
    }
    if (o[p] !== v) {
        throw new Error("Object has property '" + p + "' but its value does not match the expected value");
    }
}

function assertPropertyDoesNotExist(o, p) {
    if (o.hasOwnProperty(p)) {
        throw new Error("Object has unexpected property '" + p + "'");
    }
}

WScript.LoadScriptFile("vso_os_1091425_1.js");
WScript.LoadScriptFile("vso_os_1091425_2.js");
try {
    eval('function nonConfigurableFoo() { /* try to override non-configurable global accessor property with a function definition */ }');
} catch (e) {
    if (e.message === "Cannot redefine non-configurable property 'nonConfigurableFoo'") {
        print("Pass");
    }
    else {
        print("Fail");
    }
}
