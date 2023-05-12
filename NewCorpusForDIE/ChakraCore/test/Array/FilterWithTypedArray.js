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

class dummy {
    constructor() {
        return new Int16Array(4);
    }
}

var handler = {
    get: function(oTarget, sKey) {
        if (sKey.toString()=="constructor") {
            return { [Symbol.species] : dummy };
        } else {
            return 4;
        }
    },

    has: function (oTarget, sKey) {
        return Reflect.has(oTarget, sKey);
    },
};

var array = [1];
var proxy = new Proxy(array, handler);

try
{
    // By spec, Array.prototype.filter (and other built-ins) adds configurable properties to a new array, created from ArraySpeciesCreate. 
    // If the constructed array is a TypedArray, setting of index properties should throw a type error because they cannot be configurable.
    var boundFilter = Array.prototype.filter.bind(proxy);
    boundFilter(function() { return true; });
    WScript.Echo("TypeError expected. TypedArray indicies should be non-configurable.");
}
catch (e)
{
    if (e == "TypeError: Cannot redefine property '0'")
    {
        WScript.Echo("passed");
    }
}
