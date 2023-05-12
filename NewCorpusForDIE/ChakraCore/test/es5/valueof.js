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

 var x = {};

 WScript.Echo("x.valueOf()");
 try {
    x.valueOf();  //Fine - there's no way to inject null or undefined as the 'this' value
 }
 catch (e)
 {
    WScript.Echo(e);
 }

WScript.Echo("x.valueOf.call(undefined)");
 try {
    x.valueOf.call(undefined);  //SHOULD throw a TypeError in ES5/IE10
 }
 catch (e)
 {
    WScript.Echo(e);
 }

WScript.Echo("x.valueOf.call(null)");
 try {
    x.valueOf.call(null);  //SHOULD throw a TypeError in ES5/IE10
 }
 catch (e)
 {
    WScript.Echo(e);
 }

WScript.Echo("x.valueOf.call()");
 try {
    x.valueOf.call();  //SHOULD throw a TypeError in ES5/IE10
 }
 catch (e)
 {
    WScript.Echo(e);
 }

WScript.Echo("typeof x.valueOf.call(true)");
 WScript.Echo(typeof x.valueOf.call(true));  //SHOULD print 'object' in ES5/IE10

WScript.Echo("typeof x.valueOf.call(42)");
 WScript.Echo(typeof x.valueOf.call(42));  //SHOULD print 'object' in ES5/IE10

WScript.Echo("typeof x.valueOf.call('Hello')");
 WScript.Echo(typeof x.valueOf.call('Hello'));  //SHOULD print 'object' in ES5/IE10
