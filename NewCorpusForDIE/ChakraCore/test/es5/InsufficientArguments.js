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

function write(msg) { WScript.Echo(msg); }

function Getter() { write("GETTER"); return "GetterValue"; }

function SafeCall(f)
{
  try
  {
    f();
  }
  catch (e)
  {
    write(e.name);
  }
}

// Object.getOwnPropertyDescriptor
write("Test 1");
SafeCall(function() { Object.getOwnPropertyDescriptor(); });

write("Test 2");
SafeCall(function() { write(Object.getOwnPropertyDescriptor({})); });

write("Test 3");
SafeCall(function() { write(Object.getOwnPropertyDescriptor({'undefined':4}).value); });

// Object.defineProperty
write("Test 4");
SafeCall(function() { Object.defineProperty(); });

write("Test 5");
SafeCall(function() { Object.defineProperty({}); });

write("Test 6");
SafeCall(function() { Object.defineProperty({}, 'foo'); });

write("Test 7");
SafeCall(function() { Object.defineProperty({},
                                            { toString : function() { throw {name:'MyError'}; } });
                    });
write("Test 8");
SafeCall(function() { var obj = {};
                      Object.defineProperty(obj, undefined, { value:4, writable:true });
                      write(obj['undefined']);
                    });

// Object.defineProperties
write("Test 9");
SafeCall(function() { Object.defineProperties(); });

write("Test 10");
SafeCall(function() { Object.defineProperties({}); });

// Array.prototype methods
var obj = {};
Object.defineProperty(obj, "length", { get:Getter, configurable:true });

write("Test 11");
SafeCall(function() { Array.prototype.every.call(obj); });

write("Test 12");
SafeCall(function() { Array.prototype.some.call(obj); });

write("Test 13");
SafeCall(function() { Array.prototype.forEach.call(obj); });

write("Test 14");
SafeCall(function() { Array.prototype.map.call(obj); });

write("Test 15");
SafeCall(function() { Array.prototype.filter.call(obj); });

write("Test 16");
SafeCall(function() { Array.prototype.reduce.call(obj); });

write("Test 17");
SafeCall(function() { Array.prototype.reduceRight.call(obj); });
