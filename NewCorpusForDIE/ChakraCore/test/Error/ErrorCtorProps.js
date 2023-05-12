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

var ctors = [Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError];
safeCall(eval, "ctors.push(RegExpError);");
safeCall(eval, "ctors.push(ConversionError);");

var props = ["message", "name", "description", "call", "apply"];

for (var i in ctors)
{
    Test(ctors[i]);
}

function Test(ctor)
{
    WScript.Echo("---------------------------------");
    WScript.Echo("toString(): " + ctor.toString());
    for (var j in props)
    {
        var prop = props[j];
        WScript.Echo("Property: '" + prop + "'");
        WScript.Echo("Value: '" + ctor[prop] + "'");
        WScript.Echo("hasOwnProperty: " + ctor.hasOwnProperty(prop));
    }
    WScript.Echo();
}

function safeCall(f) {
    var args = [];
    for (var a = 1; a < arguments.length; ++a)
        args.push(arguments[a]);
    try {
        return f.apply(this, args);
    } catch (ex) {
        WScript.Echo(ex.name + ": " + ex.message);
    }
}
