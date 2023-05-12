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

var noMessage = new Error();
var withMessage = Error("I have a message for you...");

WScript.Echo("Error.prototype.name: " + Error.prototype.name);
WScript.Echo("Error.prototype.message: " + Error.prototype.message);
WScript.Echo("Error.prototype.toString(): " + Error.prototype.toString());
//WScript.Echo("Error.prototype.constructor: " + Error.prototype.constructor);

WScript.Echo("noMessage.name: " + noMessage.name);
WScript.Echo("noMessage.message: " + noMessage.message);
WScript.Echo("noMessage.toString(): " + noMessage.toString());

WScript.Echo("withMessage.name: " + withMessage.name);
WScript.Echo("withMessage.message: " + withMessage.message);
WScript.Echo("withMessage.toString(): " + withMessage.toString());

Error.prototype.name = "TryNewName";
WScript.Echo("Changing Error.prototype.name to TryNewName...");
WScript.Echo("Error.prototype.name: " + Error.prototype.name);
WScript.Echo("withMessage.name: " + withMessage.name);

try
{
  RangeError.prototype.message = "Range Error's prototype";
  throw RangeError.prototype;
}
catch(ex)
{
   WScript.Echo("Message: " + ex.message);
}