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

function foo(arr)
{
    WScript.Echo(Math.min.apply(Math, arr)); 
    WScript.Echo(Math.max.apply(Math, arr));
    WScript.Echo(); 
}

var arr = [{}, 3, 3.4, , new Array()];
var intArr = [1,2,3,4,5];
var floatArr = [1.2,2.3,3.4,4.5,5.6];
foo(arr);
foo(arr);

WScript.Echo("Testing int array");
foo(intArr);

//missing value
len = intArr.length;
intArr[len+1] = 0;
foo(intArr);
intArr.length = len;

//converting to float array
intArr[3] = 0.5;
foo(intArr);

//with a NaN element
intArr.push(Number.NaN);
foo(intArr);

WScript.Echo("Testing float array");
foo(floatArr);

//missing value
len = floatArr.length;
floatArr[len+1] = 0.45;
foo(floatArr);
floatArr.length = len;

floatArr.push(0.5);
foo(floatArr);

//with undefined (will convert the array)
floatArr.push(undefined);
foo(floatArr);