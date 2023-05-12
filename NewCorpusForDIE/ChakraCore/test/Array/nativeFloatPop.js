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

//Test0: NativeIntArray to NativeFloatArray
var ary =[1,2,3,4];

 function test0(i)
 {
    return ary.pop();
 }

 WScript.Echo("Test0:");
 WScript.Echo(test0(1));
 ary[4]=1.1; //Should Bailout as the type of the array is changed.
 WScript.Echo(test0(1));

 //Test1: NativeFloatArray - popping missing value.
 var ary2 = new Array(10);
 ary2[0] = 1.1;

 function test1()
 {
    return ary2.pop();
 }
 WScript.Echo("Test1:");
 WScript.Echo("length = "+ary2.length);
 WScript.Echo(test1());
 WScript.Echo("length = "+ary2.length);
 WScript.Echo(test1());
 WScript.Echo("length = "+ary2.length);
