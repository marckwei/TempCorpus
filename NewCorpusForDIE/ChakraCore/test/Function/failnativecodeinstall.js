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

// Confirm that we can continue executing function calls and loop bodies when we fail
// to install jitted code after the native code gen job has succeeded. (Written to run
// with /mic:2 /lic:1 /on:failnativecodeinstall.)

var x = 0;
var y;

try {
    try {
        x++;
        // Interpret f, throw on jitting of loop body
        f();
    }
    catch (e) {
        WScript.Echo('caught call ' + x++);
        // Interpret f, throw on jitting of loop body
        f();
    }
}
catch (e) {
    WScript.Echo('caught call ' + x);
    try {
        try {
            x++;
            // Throw trying to jit function body
            f();
        }
        catch (e) {
            WScript.Echo('caught call ' + x++);
            // Throw trying to jit function body
            f();
        }
    }
    catch (e) {
        WScript.Echo('done');
    }
}

function f() {
    WScript.Echo('call ' + x);
    while (1) {
        y++;
    }
}

