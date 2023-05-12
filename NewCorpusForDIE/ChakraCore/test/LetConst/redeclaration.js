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

try {
    eval("const x = 1;const x = 1;");
} catch (e) {
    WScript.Echo("Test 1:");
    WScript.Echo(e);
}
try {
    eval("const x = 1;let x = 1;");
} catch (e) {
    WScript.Echo("Test 2:");
    WScript.Echo(e);
}
try {
    eval("let x = 1;const x = 1;");
} catch (e) {
    WScript.Echo("Test 3:");
    WScript.Echo(e);
}
try {
    eval("var x = 1;const x = 1;");
} catch (e) {
    WScript.Echo("Test 4:");
    WScript.Echo(e);
}
try {
    eval("const x = 1;var x = 1;");
} catch (e) {
    WScript.Echo("Test 5:");
    WScript.Echo(e);
}
try {
    eval("var x = 1;let x = 1;");
} catch (e) {
    WScript.Echo("Test 6:");
    WScript.Echo(e);
}
try {
    eval("const x = 1;const x = 1;");
} catch (e) {
    WScript.Echo("Test 7:");
    WScript.Echo(e);
}
try {
    eval("var x = 1;const x = 1;const x = 1;");
} catch (e) {
    WScript.Echo("Test 8:");
    WScript.Echo(e);
}
try {
    eval("const x = 1;const x = 1;var x = 1;");
} catch (e) {
    WScript.Echo("Test 9:");
    WScript.Echo(e);
}


//------------
try {
    eval("(function f(){ const x = 1;const x = 1; })()");
} catch (e) {
    WScript.Echo("Test a1:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ const x = 1;let x = 1; })()");
} catch (e) {
    WScript.Echo("Test a2:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ let x = 1;const x = 1; })()");
} catch (e) {
    WScript.Echo("Test a3:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ var x = 1;const x = 1; })()");
} catch (e) {
    WScript.Echo("Test a4:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ const x = 1;var x = 1; })()");
} catch (e) {
    WScript.Echo("Test a5:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ var x = 1;let x = 1; })()");
} catch (e) {
    WScript.Echo("Test a6:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ const x = 1;const x = 1; })()");
} catch (e) {
    WScript.Echo("Test a7:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ var x = 1;const x = 1;const x = 1; })()");
} catch (e) {
    WScript.Echo("Test a8:");
    WScript.Echo(e);
}
try {
    eval("(function f(){ const x = 1;const x = 1;var x = 1; })()");
} catch (e) {
    WScript.Echo("Test a9:");
    WScript.Echo(e);
}

// ---------
try {
    eval("function a() { function f(x) { const x = 1; } } a();");
} catch (e) {
    WScript.Echo("Test b1:");
    WScript.Echo(e);
}
try {
    eval("function a() { function f(x) { let x; } } a();");
} catch (e) {
    WScript.Echo("Test b2:");
    WScript.Echo(e);
}

try {
    eval("var x; { function x() {}; } let x;");
}
catch (e) {
    WScript.Echo("Test b3:");
    WScript.Echo(e);
}
