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

function write(args)
{
 WScript.Echo(args);
}

write("TestCase1");
write(Object.preventExtensions.length);
write(Object.isExtensible({}));

write("TestCase2 - preventExtensions & add a property");
var a = {x:20, y:30};
Object.preventExtensions(a);
SafeCall(function() { a.z = 50; });
write(Object.getOwnPropertyNames(a));
write(Object.isExtensible(a));

write("TestCase3 - preventExtensions & delete a property");
var a = {x:20, y:30};
Object.preventExtensions(a);
SafeCall(function() { delete a.x; });
write(a.x);
write(Object.isExtensible(a));

write("TestCase4 - preventExtensions & modify a property");
var a = {x:20, y:30};
Object.preventExtensions(a);
SafeCall(function() { a.x = 40; });
SafeCall(function() { a.y = 60; });
write(Object.getOwnPropertyNames(a));
write(Object.isExtensible(a));
write(a.x);

write("TestCase5 - preventExtension on global object & declare a var");
Object.preventExtensions(this);
var newVar1 = 4;  // No exception here, since var decl is hoisted
try
{
  eval("var newVar2");  // Should throw TypeError
}
catch (e)
{
  write("Exception: " + e.name);
}

write("TestCase6 - preventExtensions, delete property and set remaining properties to non configurable/writable - SimpleDictionaryTypeHandler");
var a = {x:20, y:30};
Object.preventExtensions(a);
delete a.x;
Object.defineProperty(a, "y", {configurable: false});
write(Object.isSealed(a));
Object.defineProperty(a, "y", {writable: false});
write(Object.isFrozen(a));

write("TestCase7 - preventExtensions, delete property and set remaining properties to non configurable/writable - DictionaryTypeHandler");
var a = {get x() {return 0;}, y:30};
Object.preventExtensions(a);
delete a.x;
Object.defineProperty(a, "y", {configurable: false});
write(Object.isSealed(a));
Object.defineProperty(a, "y", {writable: false});
write(Object.isFrozen(a));

function SafeCall(f)
{
  try
  {
    f();
  }
  catch (e)
  {
    write("Exception: " + e.name);
  }
}

Object.preventExtensions(this);
this[10]=10; //GlobalObject set after preventExtensions
