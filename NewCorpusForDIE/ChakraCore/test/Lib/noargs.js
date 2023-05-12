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

write("escape = " + escape());
write("unescape = " + unescape());
write("eval = " + eval());
write("parseInt = " + parseInt());
write("parseFloat = " + parseFloat());
write("isNaN = " + isNaN());
write("isFinite = " + isFinite());
write("decodeURI = " + decodeURI());
write("encodeURI = " + encodeURI());
write("decodeURIComponent = " + decodeURIComponent());
write("encodeURIComponent = " + encodeURIComponent());
write("Object = " + Object());
write("Function = " + Function());
write("Array = " + Array());
write("String = " + String());
write("Boolean = " + Boolean());
write("Number = " + Number());
//write("Date = " + Date());
write("RegExp = " + RegExp());
write("Error = " + Error());
write("EvalError = " + EvalError());
write("RangeError = " + RangeError());
write("ReferenceError = " + ReferenceError());
write("SyntaxError = " + SyntaxError());
write("TypeError = " + TypeError());
write("URIError = " + URIError());
write("write: " + write);