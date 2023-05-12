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

// Constructor providers
var nonNumeric = function()
{
  return function()
  {
    this.a = 1;
    this.b = 2;
    this.c = 3;
  };
}
nonNumeric.myName = "Non-numeric";
nonNumeric.prop = 'b';

var numeric = function()
{
  return function()
  {
    this.a = 1;
    this[9] = 2;
    this.c = 3;
  };
}
numeric.myName = "Numeric";
numeric.prop = '9';

var ctorProviders = [ nonNumeric, numeric ];

// Property definers
var doNothing = function(obj, prop) {}
doNothing.myName = "No-op";

var defineAccessor = function(obj, prop)
{
  Object.defineProperty(obj, prop,
    {
      set:function(v) { WScript.Echo("SETTER: " + v); },
      get:function() { WScript.Echo("GETTER"); return "GETTERVALUE";}
  });
}
defineAccessor.myName = "Define accessor property";

var defineNonWritable = function(obj, prop)
{
  Object.defineProperty(obj, prop, { value:"NONWRITABLE", writable:false } );
}
defineNonWritable.myName = "Define non-writable property";

var defineWritable = function(obj, prop)
{
  Object.defineProperty(obj, prop, { value:"WRITABLE", writable:true } );
}
defineWritable.myName = "Define writable property";

var definers = [doNothing, defineAccessor, defineNonWritable, defineWritable];

var testId = 1;

for (var i = 0; i < definers.length; i++)
{
  var define = definers[i];
  for (var j = 0; j < ctorProviders.length; j++)
  {
    var provider = ctorProviders[j];
    var ctor = provider();
    WScript.Echo("Test " + testId++ + ": " + provider.myName + ", " + define.myName);
    var o = new ctor();
    print(o, provider.prop);
    define(ctor.prototype, provider.prop);
    o = new ctor();
    print(o, provider.prop);
  }
}

function print(o, prop)
{
  WScript.Echo("a: " + o.a);
  WScript.Echo(prop + ": " + o[prop]);
  WScript.Echo("c: " + o.c);
}
