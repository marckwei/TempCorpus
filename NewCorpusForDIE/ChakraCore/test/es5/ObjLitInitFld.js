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

var obj = {1:1, foo:1};
Output(obj);

Object.defineProperty(Object.prototype, '1', { value:"ProtoFoo", writable:false, configurable:true, enumerable:true });
Object.defineProperty(Object.prototype, 'foo', { value:"ProtoFoo", writable:false, configurable:true, enumerable:true });

var obj = {1:1, foo:1};
Output(obj);

delete Object.prototype[1];
delete Object.prototype.foo;

Object.defineProperty(Object.prototype, '1', {
  get: function() { WScript.Echo("GETTER"); },
  set: function(v) { WScript.Echo("SETTER"); },
  configurable:true, enumerable:true });
Object.defineProperty(Object.prototype, 'foo', {
  get: function() { WScript.Echo("GETTER"); },
  set: function(v) { WScript.Echo("SETTER"); },
  configurable:true, enumerable:true });

var obj = {1:1, foo:1};
Output(obj);

function Output(o)
{
  for (var i in o)
  {
    WScript.Echo(i + ": '" + o[i] + "'");
  }
}
