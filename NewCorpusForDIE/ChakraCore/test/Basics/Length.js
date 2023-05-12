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

var o = new Object();
o.length = 10;
write(o.length + " " + o["length"] + " " + o["len" + "gth"]);

o.length = 20;
write(o.length + " " + o["length"] + " " + o["len" + "gth"]);


var s = "Hello World";
write(s.length + " " + s["length"] + " " + s["len" + "gth"]);

var x = s.length = 30;

write(x);
write(s.length + " " + s["length"] + " " + s["len" + "gth"]);

var o1 = new Object();
var a = [1000,2000,3000];

// Normal index
write(a[0] + " " + a["0"] + " " + a[0.0]);

// 'x' Expando
a.x = 40;

write(a.x + " " + a["x"]);

// object o as expando
a[o] = 50;
write(a[o] + " " + a[o1] + " " + a["[object Object]"] + " " + a["[object" + " Object]"]);


// array length
write(a.length + " " + a["length"] + " " + a["len" + "gth"]);

a.length = 60;
write(a.length + " " + a["length"] + " " + a["len" + "gth"]);

a["length"] = 70;
write(a.length + " " + a["length"] + " " + a["len" + "gth"]);

a["le" + "ngth"] = 80;
write(a.length + " " + a["length"] + " " + a["len" + "gth"]);

function foo() {};
write(foo.length + " " + foo["length"] + " " + foo["len" + "gth"]);

function foo1(x) {};
write(foo1.length + " " + foo1["length"] + " " + foo1["len" + "gth"]);

function foo2(x,y,z) {};
write(foo2.length + " " + foo2["length"] + " " + foo2["len" + "gth"]);

eval("function foo3(x,y){};");
write(foo3.length + " " + foo3["length"] + " " + foo3["len" + "gth"]);
