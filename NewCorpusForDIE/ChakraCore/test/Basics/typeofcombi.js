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

function main()
{
    var number_object = new Number(4.2);
    var string_object = new String("Hello, World!");
    WScript.Echo(typeof(undefined) == "undefined");
    if (typeof(undefined) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) == "object");
    if (typeof(undefined) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) == "boolean");
    if (typeof(undefined) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) == "number");
    if (typeof(undefined) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) == "string");
    if (typeof(undefined) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) == "function");
    if (typeof(undefined) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) != "undefined");
    if (typeof(undefined) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) != "object");
    if (typeof(undefined) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) != "boolean");
    if (typeof(undefined) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) != "number");
    if (typeof(undefined) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) != "string");
    if (typeof(undefined) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) != "function");
    if (typeof(undefined) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) === "undefined");
    if (typeof(undefined) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) === "object");
    if (typeof(undefined) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) === "boolean");
    if (typeof(undefined) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) === "number");
    if (typeof(undefined) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) === "string");
    if (typeof(undefined) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) === "function");
    if (typeof(undefined) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) !== "undefined");
    if (typeof(undefined) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) !== "object");
    if (typeof(undefined) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) !== "boolean");
    if (typeof(undefined) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) !== "number");
    if (typeof(undefined) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) !== "string");
    if (typeof(undefined) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(undefined) !== "function");
    if (typeof(undefined) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) == "undefined");
    if (typeof(null) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) == "object");
    if (typeof(null) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) == "boolean");
    if (typeof(null) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) == "number");
    if (typeof(null) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) == "string");
    if (typeof(null) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) == "function");
    if (typeof(null) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) != "undefined");
    if (typeof(null) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) != "object");
    if (typeof(null) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) != "boolean");
    if (typeof(null) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) != "number");
    if (typeof(null) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) != "string");
    if (typeof(null) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) != "function");
    if (typeof(null) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) === "undefined");
    if (typeof(null) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) === "object");
    if (typeof(null) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) === "boolean");
    if (typeof(null) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) === "number");
    if (typeof(null) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) === "string");
    if (typeof(null) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) === "function");
    if (typeof(null) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) !== "undefined");
    if (typeof(null) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) !== "object");
    if (typeof(null) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) !== "boolean");
    if (typeof(null) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) !== "number");
    if (typeof(null) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) !== "string");
    if (typeof(null) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(null) !== "function");
    if (typeof(null) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) == "undefined");
    if (typeof({}) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) == "object");
    if (typeof({}) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) == "boolean");
    if (typeof({}) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) == "number");
    if (typeof({}) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) == "string");
    if (typeof({}) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) == "function");
    if (typeof({}) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) != "undefined");
    if (typeof({}) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) != "object");
    if (typeof({}) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) != "boolean");
    if (typeof({}) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) != "number");
    if (typeof({}) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) != "string");
    if (typeof({}) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) != "function");
    if (typeof({}) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) === "undefined");
    if (typeof({}) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) === "object");
    if (typeof({}) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) === "boolean");
    if (typeof({}) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) === "number");
    if (typeof({}) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) === "string");
    if (typeof({}) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) === "function");
    if (typeof({}) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) !== "undefined");
    if (typeof({}) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) !== "object");
    if (typeof({}) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) !== "boolean");
    if (typeof({}) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) !== "number");
    if (typeof({}) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) !== "string");
    if (typeof({}) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof({}) !== "function");
    if (typeof({}) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) == "undefined");
    if (typeof(string_object) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) == "object");
    if (typeof(string_object) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) == "boolean");
    if (typeof(string_object) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) == "number");
    if (typeof(string_object) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) == "string");
    if (typeof(string_object) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) == "function");
    if (typeof(string_object) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) != "undefined");
    if (typeof(string_object) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) != "object");
    if (typeof(string_object) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) != "boolean");
    if (typeof(string_object) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) != "number");
    if (typeof(string_object) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) != "string");
    if (typeof(string_object) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) != "function");
    if (typeof(string_object) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) === "undefined");
    if (typeof(string_object) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) === "object");
    if (typeof(string_object) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) === "boolean");
    if (typeof(string_object) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) === "number");
    if (typeof(string_object) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) === "string");
    if (typeof(string_object) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) === "function");
    if (typeof(string_object) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) !== "undefined");
    if (typeof(string_object) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) !== "object");
    if (typeof(string_object) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) !== "boolean");
    if (typeof(string_object) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) !== "number");
    if (typeof(string_object) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) !== "string");
    if (typeof(string_object) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(string_object) !== "function");
    if (typeof(string_object) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) == "undefined");
    if (typeof(number_object) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) == "object");
    if (typeof(number_object) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) == "boolean");
    if (typeof(number_object) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) == "number");
    if (typeof(number_object) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) == "string");
    if (typeof(number_object) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) == "function");
    if (typeof(number_object) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) != "undefined");
    if (typeof(number_object) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) != "object");
    if (typeof(number_object) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) != "boolean");
    if (typeof(number_object) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) != "number");
    if (typeof(number_object) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) != "string");
    if (typeof(number_object) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) != "function");
    if (typeof(number_object) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) === "undefined");
    if (typeof(number_object) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) === "object");
    if (typeof(number_object) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) === "boolean");
    if (typeof(number_object) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) === "number");
    if (typeof(number_object) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) === "string");
    if (typeof(number_object) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) === "function");
    if (typeof(number_object) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) !== "undefined");
    if (typeof(number_object) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) !== "object");
    if (typeof(number_object) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) !== "boolean");
    if (typeof(number_object) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) !== "number");
    if (typeof(number_object) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) !== "string");
    if (typeof(number_object) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(number_object) !== "function");
    if (typeof(number_object) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) == "undefined");
    if (typeof(true) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) == "object");
    if (typeof(true) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) == "boolean");
    if (typeof(true) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) == "number");
    if (typeof(true) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) == "string");
    if (typeof(true) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) == "function");
    if (typeof(true) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) != "undefined");
    if (typeof(true) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) != "object");
    if (typeof(true) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) != "boolean");
    if (typeof(true) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) != "number");
    if (typeof(true) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) != "string");
    if (typeof(true) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) != "function");
    if (typeof(true) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) === "undefined");
    if (typeof(true) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) === "object");
    if (typeof(true) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) === "boolean");
    if (typeof(true) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) === "number");
    if (typeof(true) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) === "string");
    if (typeof(true) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) === "function");
    if (typeof(true) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) !== "undefined");
    if (typeof(true) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) !== "object");
    if (typeof(true) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) !== "boolean");
    if (typeof(true) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) !== "number");
    if (typeof(true) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) !== "string");
    if (typeof(true) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(true) !== "function");
    if (typeof(true) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) == "undefined");
    if (typeof(false) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) == "object");
    if (typeof(false) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) == "boolean");
    if (typeof(false) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) == "number");
    if (typeof(false) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) == "string");
    if (typeof(false) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) == "function");
    if (typeof(false) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) != "undefined");
    if (typeof(false) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) != "object");
    if (typeof(false) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) != "boolean");
    if (typeof(false) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) != "number");
    if (typeof(false) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) != "string");
    if (typeof(false) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) != "function");
    if (typeof(false) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) === "undefined");
    if (typeof(false) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) === "object");
    if (typeof(false) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) === "boolean");
    if (typeof(false) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) === "number");
    if (typeof(false) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) === "string");
    if (typeof(false) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) === "function");
    if (typeof(false) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) !== "undefined");
    if (typeof(false) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) !== "object");
    if (typeof(false) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) !== "boolean");
    if (typeof(false) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) !== "number");
    if (typeof(false) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) !== "string");
    if (typeof(false) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(false) !== "function");
    if (typeof(false) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) == "undefined");
    if (typeof(42) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) == "object");
    if (typeof(42) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) == "boolean");
    if (typeof(42) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) == "number");
    if (typeof(42) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) == "string");
    if (typeof(42) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) == "function");
    if (typeof(42) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) != "undefined");
    if (typeof(42) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) != "object");
    if (typeof(42) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) != "boolean");
    if (typeof(42) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) != "number");
    if (typeof(42) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) != "string");
    if (typeof(42) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) != "function");
    if (typeof(42) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) === "undefined");
    if (typeof(42) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) === "object");
    if (typeof(42) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) === "boolean");
    if (typeof(42) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) === "number");
    if (typeof(42) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) === "string");
    if (typeof(42) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) === "function");
    if (typeof(42) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) !== "undefined");
    if (typeof(42) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) !== "object");
    if (typeof(42) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) !== "boolean");
    if (typeof(42) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) !== "number");
    if (typeof(42) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) !== "string");
    if (typeof(42) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(42) !== "function");
    if (typeof(42) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) == "undefined");
    if (typeof(4.20) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) == "object");
    if (typeof(4.20) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) == "boolean");
    if (typeof(4.20) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) == "number");
    if (typeof(4.20) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) == "string");
    if (typeof(4.20) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) == "function");
    if (typeof(4.20) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) != "undefined");
    if (typeof(4.20) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) != "object");
    if (typeof(4.20) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) != "boolean");
    if (typeof(4.20) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) != "number");
    if (typeof(4.20) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) != "string");
    if (typeof(4.20) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) != "function");
    if (typeof(4.20) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) === "undefined");
    if (typeof(4.20) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) === "object");
    if (typeof(4.20) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) === "boolean");
    if (typeof(4.20) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) === "number");
    if (typeof(4.20) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) === "string");
    if (typeof(4.20) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) === "function");
    if (typeof(4.20) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) !== "undefined");
    if (typeof(4.20) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) !== "object");
    if (typeof(4.20) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) !== "boolean");
    if (typeof(4.20) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) !== "number");
    if (typeof(4.20) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) !== "string");
    if (typeof(4.20) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(4.20) !== "function");
    if (typeof(4.20) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) == "undefined");
    if (typeof(Math.PI) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) == "object");
    if (typeof(Math.PI) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) == "boolean");
    if (typeof(Math.PI) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) == "number");
    if (typeof(Math.PI) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) == "string");
    if (typeof(Math.PI) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) == "function");
    if (typeof(Math.PI) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) != "undefined");
    if (typeof(Math.PI) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) != "object");
    if (typeof(Math.PI) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) != "boolean");
    if (typeof(Math.PI) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) != "number");
    if (typeof(Math.PI) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) != "string");
    if (typeof(Math.PI) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) != "function");
    if (typeof(Math.PI) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) === "undefined");
    if (typeof(Math.PI) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) === "object");
    if (typeof(Math.PI) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) === "boolean");
    if (typeof(Math.PI) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) === "number");
    if (typeof(Math.PI) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) === "string");
    if (typeof(Math.PI) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) === "function");
    if (typeof(Math.PI) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) !== "undefined");
    if (typeof(Math.PI) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) !== "object");
    if (typeof(Math.PI) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) !== "boolean");
    if (typeof(Math.PI) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) !== "number");
    if (typeof(Math.PI) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) !== "string");
    if (typeof(Math.PI) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(Math.PI) !== "function");
    if (typeof(Math.PI) !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") == "undefined");
    if (typeof("Hello, World!") == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") == "object");
    if (typeof("Hello, World!") == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") == "boolean");
    if (typeof("Hello, World!") == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") == "number");
    if (typeof("Hello, World!") == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") == "string");
    if (typeof("Hello, World!") == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") == "function");
    if (typeof("Hello, World!") == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") != "undefined");
    if (typeof("Hello, World!") != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") != "object");
    if (typeof("Hello, World!") != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") != "boolean");
    if (typeof("Hello, World!") != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") != "number");
    if (typeof("Hello, World!") != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") != "string");
    if (typeof("Hello, World!") != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") != "function");
    if (typeof("Hello, World!") != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") === "undefined");
    if (typeof("Hello, World!") === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") === "object");
    if (typeof("Hello, World!") === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") === "boolean");
    if (typeof("Hello, World!") === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") === "number");
    if (typeof("Hello, World!") === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") === "string");
    if (typeof("Hello, World!") === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") === "function");
    if (typeof("Hello, World!") === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") !== "undefined");
    if (typeof("Hello, World!") !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") !== "object");
    if (typeof("Hello, World!") !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") !== "boolean");
    if (typeof("Hello, World!") !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") !== "number");
    if (typeof("Hello, World!") !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") !== "string");
    if (typeof("Hello, World!") !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof("Hello, World!") !== "function");
    if (typeof("Hello, World!") !== "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) == "undefined");
    if (typeof(function(){}) == "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) == "object");
    if (typeof(function(){}) == "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) == "boolean");
    if (typeof(function(){}) == "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) == "number");
    if (typeof(function(){}) == "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) == "string");
    if (typeof(function(){}) == "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) == "function");
    if (typeof(function(){}) == "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) != "undefined");
    if (typeof(function(){}) != "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) != "object");
    if (typeof(function(){}) != "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) != "boolean");
    if (typeof(function(){}) != "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) != "number");
    if (typeof(function(){}) != "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) != "string");
    if (typeof(function(){}) != "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) != "function");
    if (typeof(function(){}) != "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) === "undefined");
    if (typeof(function(){}) === "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) === "object");
    if (typeof(function(){}) === "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) === "boolean");
    if (typeof(function(){}) === "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) === "number");
    if (typeof(function(){}) === "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) === "string");
    if (typeof(function(){}) === "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) === "function");
    if (typeof(function(){}) === "function") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) !== "undefined");
    if (typeof(function(){}) !== "undefined") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) !== "object");
    if (typeof(function(){}) !== "object") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) !== "boolean");
    if (typeof(function(){}) !== "boolean") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) !== "number");
    if (typeof(function(){}) !== "number") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) !== "string");
    if (typeof(function(){}) !== "string") WScript.Echo(true); else WScript.Echo(false);
    WScript.Echo(typeof(function(){}) !== "function");
    if (typeof(function(){}) !== "function") WScript.Echo(true); else WScript.Echo(false);
}

main();
