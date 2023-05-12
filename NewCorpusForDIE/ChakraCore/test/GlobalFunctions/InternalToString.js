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

function writeLine(v) {
    v = v.replace(/\(pdt\)/g, "(pacific daylight time)")
         .replace(/\(pst\)/g, "(pacific standard time)");
    WScript.Echo(v);
}

var a = new Object();
a.toString = function() { writeLine("In toString() ");  return "foo" }
var v = String.prototype.toLowerCase.call(a);
writeLine("Test call ToString - user defined object: " + v);

a = true;
v = String.prototype.toLowerCase.call(a);
writeLine("Test call ToString - bool: " + v);

a = 123
v = String.prototype.toLowerCase.call(a);
writeLine("Test call ToString - number: " + v);

a = new Date();
a.setTime(20000)
v = String.prototype.toLowerCase.call(a);
writeLine("Test call ToString - date: " + v);
