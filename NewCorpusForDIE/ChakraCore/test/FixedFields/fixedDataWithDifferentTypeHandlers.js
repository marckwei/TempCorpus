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

//****************Test0 creates a SimpleDictionaryTypeHandler****************
var B = 6;

function test0()
{
    return B;
}

WScript.Echo(test0());
//JIT test() with fixedDataProp
WScript.Echo(test0());
B++;
//Should bail out during this call
WScript.Echo(test0());


//****************Test 1 creates a PathTypeHandler****************
var obj = {A:1}

function test1()
{
    return obj.A;
}

WScript.Echo(test1());
WScript.Echo(test1());
obj.A = 2;
//Bails out here, since a new property is added.
WScript.Echo(test1());

//*******************Test2: Creates a DictionaryTypeHandler****************
Object.prototype.C = 5;

function test2()
{
    return C;
}

WScript.Echo(test2());
WScript.Echo(test2());
C=2;
WScript.Echo(test2());



