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

//
// Test calling order of parameters:
// 1. Ensure arguments get evaluated in the correct order
// 2. Ensure arguments are passed in the correct order
//

function a()
{
    //
    // By displaying the function, we'll validate the correct evaluation order.
    //

    WScript.Echo("a()");
    return 1;
}

function b()
{
    WScript.Echo("b()");
    return 2;
}

function c(p1, p2)
{
    //
    // By performing a subtract, we'll validate that p1 and p2 are not mixed.
    //

    WScript.Echo("c(p1, p2)");
    return p1 - p2;
}

function MyClass(p1, p2) {
    //
    // By performing a subtract, we'll validate that p1 and p2 are not mixed.
    //

    WScript.Echo("MyClass(p1, p2)");
    this.value = p1 - p2;
}


//
// Test a regular function call.
//

WScript.Echo("Regular function call");

var result = c(a(), b());
WScript.Echo(result);


//
// Test a constructor function call.
//

WScript.Echo("Constructor function call");

var result = new MyClass(a(), b());
WScript.Echo(result.value);
