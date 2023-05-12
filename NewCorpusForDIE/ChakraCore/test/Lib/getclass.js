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

function write(v) { WScript.Echo(v + ""); }

Array.prototype.getClass = Object.prototype.toString; 
Boolean.prototype.getClass = Object.prototype.toString;
Date.prototype.getClass = Object.prototype.toString;
Function.prototype.getClass = Object.prototype.toString; 
Number.prototype.getClass = Object.prototype.toString; 
RegExp.prototype.getClass = Object.prototype.toString; 
String.prototype.getClass = Object.prototype.toString; 

var a1 = new Array();
var b1 = new Boolean(false);
var d1 = new Date();
var f1 = new Function("return undefined;");
var n1 = new Number(+0);
var r1 = new RegExp();
var s1 = new String("hello");

write("a1.getClass()                : " + a1.getClass());
write("Array.prototype.getClass()   : " + Array.prototype.getClass());

write("b1.getClass()                : " + b1.getClass());
write("Boolean.prototype.getClass() : " + Boolean.prototype.getClass());

write("d1.getClass()                : " + d1.getClass());
write("Date.prototype.getClass()    : " + Date.prototype.getClass());

write("f1.getClass()                : " + f1.getClass());
write("Function.prototype.getClass(): " + Function.prototype.getClass());

write("n1.getClass()                : " + n1.getClass());
write("Number.prototype.getClass()  : " + Number.prototype.getClass());

write("r1.getClass()                : " + r1.getClass());
write("RegExp.prototype.getClass()  : " + RegExp.prototype.getClass());

write("s1.getClass()                : " + s1.getClass());
write("String.prototype.getClass()  : " + String.prototype.getClass());