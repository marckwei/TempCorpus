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
   WScript.Echo(x.indexOf(i));
   for(j=-3; j< 15;j++)
   {
        WScript.Echo(x.indexOf(x[i],j));
        WScript.Echo(x.indexOf(i,j));
   }
}

WScript.Echo(x.indexOf(-0, -0));

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

WScript.Echo(y.indexOf("abc"));
WScript.Echo(y.indexOf("abc", 3));
WScript.Echo(y.indexOf("abc", 2));
WScript.Echo(y.indexOf("abc", -2));

WScript.Echo(y.indexOf("efg"));
WScript.Echo(y.indexOf("efg", 6));
WScript.Echo(y.indexOf("efg", 1));
WScript.Echo(y.indexOf("efg", -3));

WScript.Echo(y.indexOf("xyg"));
WScript.Echo(y.indexOf("esg", 2));
WScript.Echo(y.indexOf("eag", 2));
WScript.Echo(y.indexOf("", -2));

WScript.Echo(y.indexOf(true));
WScript.Echo(y.indexOf(false));
WScript.Echo(y.indexOf(new Boolean(true)));

WScript.Echo(y.indexOf(a , 6));
WScript.Echo(y.indexOf(a , 1));
WScript.Echo(y.indexOf(a ));
WScript.Echo(y.indexOf(b));

WScript.Echo(y.indexOf(null));


WScript.Echo(y.indexOf());

//implicit calls
var a ;
var arr = [10];
Object.defineProperty(Array.prototype, "4", {configurable : true, get: function(){a = true; return 30;}});
a = false;
arr.length = 6;
var f = arr.indexOf(30);
WScript.Echo(a);

//Float array with gaps
var floatArray = new Array(5.5, 5.6);
floatArray[6] =  5.6;
WScript.Echo(floatArray.indexOf(5.7));

// Cases where we do/don't have to resume after failing to find the value in the head segment.
// Run with -forcearraybtree to really stress these.
var gap = [0, 1];
WScript.Echo(gap.indexOf(4));
Array.prototype[2] = 'foo';
WScript.Echo(gap.indexOf('foo'));
gap[5] = 4;
WScript.Echo(gap.indexOf('foo'));
WScript.Echo(gap.indexOf(4));

gap = [0, 1.1];
WScript.Echo(gap.indexOf(4));
Array.prototype[2] = 'bar';
WScript.Echo(gap.indexOf('bar'));
gap[5] = 4;
WScript.Echo(gap.indexOf(4));
WScript.Echo(gap.indexOf('bar'));

gap = [0, 'test'];
WScript.Echo(gap.indexOf(4));
Array.prototype[2] = 4;
WScript.Echo(gap.indexOf(4));
gap[5] = 4;
WScript.Echo(gap.indexOf(4));
delete Array.prototype[2]
WScript.Echo(gap.indexOf(4));

var undefinedValues = [];
undefinedValues[9] = "abc";
undefinedValues[10] = undefined;
WScript.Echo(undefinedValues.indexOf(undefined));

undefinedValues.length = 8;
WScript.Echo(undefinedValues.indexOf(undefined));

WScript.Echo(Array.prototype.indexOf.prototype === undefined);
WScript.Echo("prototype" in Array.prototype.indexOf)
