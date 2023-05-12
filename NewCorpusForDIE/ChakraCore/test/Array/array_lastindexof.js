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

var x = [1, 2, 2, 4, 5, +0, -0, NaN, 0, true, true , false]

for(i=-3; i < 15;i++)
{
   WScript.Echo(x.lastIndexOf(i));
   for(j=-3; j< 15;j++)
   {
    WScript.Echo(x.lastIndexOf(x[i],j));
    WScript.Echo(x.lastIndexOf(i,j));
   }
}

var b = function(){};
b.prototype = Array.prototype;

var y = new b();

var z = new Object();
var a = new Object();

y[0] = "abc";
y[1] = "def";
y[2] = "efg";
y[3] = true;
y[4] = true;
y[5] = false;
y[6] = a;
y[7] = a;
y[8] = null;

y.length = 10;

WScript.Echo(y.lastIndexOf("abc"));
WScript.Echo(y.lastIndexOf("abc", 3));
WScript.Echo(y.lastIndexOf("abc", 2));
WScript.Echo(y.lastIndexOf("abc", -2));

WScript.Echo(y.lastIndexOf("efg"));
WScript.Echo(y.lastIndexOf("efg", 6));
WScript.Echo(y.lastIndexOf("efg", 1));
WScript.Echo(y.lastIndexOf("efg", -3));

WScript.Echo(y.lastIndexOf("xyg"));
WScript.Echo(y.lastIndexOf("esg", 2));
WScript.Echo(y.lastIndexOf("eag", 2));
WScript.Echo(y.lastIndexOf("", -2));

WScript.Echo(y.lastIndexOf(true));
WScript.Echo(y.lastIndexOf(false));
WScript.Echo(y.lastIndexOf(new Boolean(true)));

WScript.Echo(y.lastIndexOf(a , 6));
WScript.Echo(y.lastIndexOf(a , 1));
WScript.Echo(y.lastIndexOf(a ));
WScript.Echo(y.lastIndexOf(b));

WScript.Echo(y.lastIndexOf(null));

WScript.Echo(y.lastIndexOf());

//implicit calls
var a ;
var arr = [10];
Object.defineProperty(Array.prototype, "4", {configurable : true, get: function(){a = true; return 30;}});
a = false;
arr.length = 6;
var f = arr.lastIndexOf(30);
WScript.Echo(a);
