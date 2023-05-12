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

var GiantPrintArray = [];

function test0()
{
   GiantPrintArray.push(3.2);
   GiantPrintArray.push(true);
}

test0();
//Profiled as NativeFloatArray
test0();

for(var i =0;i<GiantPrintArray.length;i++){
 WScript.Echo(GiantPrintArray[i]);
 };

function test1()
{
    var ary;
    GiantPrintArray.push(2);
    GiantPrintArray.push(ary);
}

test1();
//Profiled as NativeIntArray
test1();

for(var i =0;i<GiantPrintArray.length;i++){
 WScript.Echo(GiantPrintArray[i]);
 };

function test2(a)
{
    GiantPrintArray.push(a);
}

var GiantPrintArray = [1.1];
test2(1);
//Profiled as NativeFloatArray
var ary;
test2(ary);

for(var i =0;i<GiantPrintArray.length;i++){
 WScript.Echo(GiantPrintArray[i]);
 };

function test3()
{
        GiantPrintArray = [{}];
        GiantPrintArray.push(7);

}

test3();
//Profiled as Var Array
test3();

for(var i =0;i<GiantPrintArray.length;i++){
 WScript.Echo(GiantPrintArray[i]);
 };
