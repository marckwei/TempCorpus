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

//Test odd parameters
var a = [0.6, 1.34, 2.5, 3.34, 4.454, 5.65, 6.634];
var x = a.splice(-100, -100);
WScript.Echo(a);
WScript.Echo(x);

x = a.splice();
WScript.Echo(a);
WScript.Echo(x);

x = a.splice(0);
WScript.Echo(a);
WScript.Echo(x);

var x = a.splice(0, 0);
WScript.Echo(a);
WScript.Echo(x);


var x = a.splice(1, -4);
WScript.Echo(a);
WScript.Echo(x);

var x = a.splice(7, -4, 8, 9, 10);
WScript.Echo(a);
WScript.Echo(x);

var x = a.splice(20, 40);
WScript.Echo(a);
WScript.Echo(x);

var x = a.splice(-20, 4, 11, 12);
WScript.Echo(a);
WScript.Echo(x);

x = a.splice(-100, -100);
WScript.Echo(a);
WScript.Echo(x);

//Test array
var b = [8.32,9.232];
var c = [11.232,12.234];

x = a.splice(5,1);
WScript.Echo(x);
WScript.Echo(a);

x = a.splice(2, 2, b, c);
WScript.Echo(x);
WScript.Echo(a);

x = a.splice(-2, -2, b, c);
WScript.Echo(x);
WScript.Echo(a);

x = a.splice(10, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b);
WScript.Echo(x);
WScript.Echo(a);

var d = [1, [2, 3, 4], [5, 6, 7]];
x = a.splice(5, 1, d);
WScript.Echo(x);
WScript.Echo(a);

var f = new Object();
f.x = 0;
f.y = 1;
f.z = 2;

x = a.splice(1,2, f, "hello");
WScript.Echo(x);
WScript.Echo(a);


//Test object
var x = new Object();

x.length = 6;
x[0] = 1.23;
x[1] = 2.23;
x[2] = 3.23;
x[3] = 4.54;
x[4] = 5.66;
x[5] = 6.45;


x.foo = Array.prototype.splice;
WScript.Echo(x.length);
var y = x.foo(0, 1, 9, 10, 11, 12);
WScript.Echo(y);
WScript.Echo(x.length);

y = x.foo(0, 9);
WScript.Echo(y);
WScript.Echo(x.length);

y = x.foo(0, 0, 1, 2, 3, 4, 5, 6);
WScript.Echo(y);
WScript.Echo(x.length);

y = x.foo(3, 3, 7);
WScript.Echo(y);
WScript.Echo(x.length);

y = x.foo(0, 8);
WScript.Echo(y);
WScript.Echo(x.length);

//Test string
x = new String("hello world");
x.foo = Array.prototype.splice;
y = undefined;
try
{
 y = x.foo(0, 5);
}
catch(e)
{
 if (!e instanceof TypeError) throw(e);
 WScript.Echo(y);
 WScript.Echo(x);
}

try
{
 y = x.foo(0, 5);
}
catch(e)
{
 if (!e instanceof TypeError) throw(e);
 WScript.Echo(y);
 WScript.Echo(x);
}

try
{
 y = x.foo(0, 13);
}
 catch(e)
{
 if (!e instanceof TypeError) throw(e);
 WScript.Echo(y);
 WScript.Echo(x);
}

WScript.Echo("Test: splice when the item to replace is not writable."); // WOOB: 1139812
var a = {};
Object.defineProperty(a, "0", { value: 0 });
Object.defineProperty(a, "1", { value: 1 });
a.length = 2;
try {
  Array.prototype.splice.apply(a, [0, 1, 'z']);
} catch (ex) {
  WScript.Echo("e instanceOf TypeError = " + (ex instanceof TypeError));
}
WScript.Echo("a.length = " + a.length);

a = new Array(1000);
x = a.splice(1, 17, "a");

function test0()
{
    var arr = [0,1.12,2.23,3,4.32,5,6.23,7,8,9];
    for(var __loopvar4 = 0; __loopvar4 < 2; __loopvar4++)
    {
      arr.length --;
      arr.splice(3,1,31.23,32.32,33.23);
    }
    return arr.length;
}
WScript.Echo("arr.length = " + test0());