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


var o;

o = Object();
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object();
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(null);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o2 = new Object(null);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(undefined);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object(undefined);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(true);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object(true);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(new Boolean(false));
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object(new Boolean(false));
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(0);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object(0);
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(new Number(10));
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object(new Number(10));
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object("hello");
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object("hello");
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

o = Object(new String("hello"));
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));
o = new Object(new String("hello"));
write("o:"  + o + " typeof(o):" + typeof(o) + " o.toString():" + Object.prototype.toString.call(o));

var b = new Boolean(true);
b.x = 10;
o = new Object(b);
write("o.x = " + o.x);

var n = new Number(100);
n.x = 20;
o = new Object(n);
write("o.x = " + o.x);

var s = new String("world");
s.x = 30;
o = new Object(s);
write("o.x = " + o.x);