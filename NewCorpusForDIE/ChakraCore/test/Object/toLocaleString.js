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

function write(v) { WScript.Echo(v + ""); }

var n1 = new Number(10);
n1.toString = function() { return 20; }

var n2 = new Number(30);
n2.valueOf = function() { return 40; }

var n3 = new Number(50);
n3.toString = function() { return 60; }
n3.valueOf  = function() { return 70; }

var d1 = new Date(1974, 9, 24, 0, 20, 30, 40, 50);

var a1 = [ 10, 20 ];
a1.toString = function() { return "array a1"; }

var a2 = [ 10.123, 20.456 ];

var values = [
    0, 1, -1, 
    12345678, 10.23344, -1.2345,
    NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number(11111111222),
    "hello", new String("hello" + "world"),
    false, new Boolean(true),
    new Object(),
    n1, n2, n3,
    d1,
    a1, a2,
    12345678912345678,
    1
];

var v;
for (var i=0;i<values.length; i++)
{
    v = values[i];
    write(i + " toString()     : " + v.toString());
    write(i + " toLocaleString : " + v.toLocaleString());    
}

var arr = [1, values, null, undefined, , 20];

arr[arr.length] = arr;
arr[arr.length] = "LastValue!!";

write("arr.toString()     : " + arr.toString());
write("arr.toLocaleString : " + arr.toLocaleString());

var arr1 = new Array (7) ;
write("arr1.toString()     : " + arr1.toString());
write("arr1.toLocaleString : " + arr1.toLocaleString());