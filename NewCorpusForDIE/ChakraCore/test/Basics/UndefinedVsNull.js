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

//
// Test Equals operator with abstract equality comparison algorithm (ES3.0: S11.9.1, S11.9.3)
//

if (undefined == null)
    WScript.Echo("Algorithm says equivalent");
else
    WScript.Echo("Objects are not equivalent");

//
// Test Strict Equals operator (ES3.0: S11.9.4)
//

if (undefined === null)
    WScript.Echo("Same instance");
else
    WScript.Echo("Different instances");

if (undefined === undefined)
    WScript.Echo("Same instance");
else
    WScript.Echo("Different instances");

if (null === null)
    WScript.Echo("Same instance");
else
    WScript.Echo("Different instances");

function dump(a, index)
{
    var value = a[index];
    if (value === undefined)
    {
        WScript.Echo("'undefined'");
    }
    else if (value === null)
    {
        WScript.Echo("'null'");
    }
    else
    {
        WScript.Echo(value);
    }
}

//
// Create an array and grow it, ensuring that all empty slots are properly set to 'undefined'
//

var a = new Array(2);

dump(a, 0);
dump(a, 1);

dump(a, 10);
a[10] = 'A';
dump(a, 10);

dump(a, 5);
