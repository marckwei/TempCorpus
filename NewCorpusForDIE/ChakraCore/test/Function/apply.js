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

function check(value, expected) {
    if (value !== expected) {
        throw new Error("Test failed");
    }
}

function f1() 
{
    this.x1 = "hello";
}

f1.apply();
check(x1, "hello");

x1 = 0;
f1.apply(null);
check(x1, "hello");

x1 = 0;
f1.apply(undefined);
check(x1, "hello");

var o = new Object();

x1 = 0;
f1.apply(o);
check(x1, 0);
check(o.x1, "hello");

function f2(a)
{
    this.x2 = a;
}

x2 = 0;
f2.apply();
check(x2, undefined);

x2 = 0;
f2.apply(null);
check(x2, undefined);

x2 = 0;
f2.apply(undefined);
check(x2, undefined);

x2 = 0;
f2.apply(o);
check(x2, 0);
check(o.x2, undefined);

x2 = 0;
f2.apply(null, ["world"]);
check(x2, "world");

x2 = 0;
f2.apply(undefined, ["world"]);
check(x2, "world");

x2 = 0;
f2.apply(o, ["world"]);
check(x2, 0);
check(o.x2, "world");


function blah()
{
    this.construct.apply(this, arguments);
    return new Object();
}

function blah2()
{
    try
    {
        this.construct.apply(this, arguments);
    }
    catch (e)
    {
    }

    return new Object();
}

blah.prototype.construct = function(x, y)
{
    this.a = x;
    this.b = y;
}
blah2.prototype.construct = function(x, y)
{
    this.a = x;
    this.b = y;
}

var o = new blah(1, 2);
check(o.a, undefined);
check(o.b, undefined);

o = new blah2(1, 2);

check(o.a, undefined);
check(o.b, undefined);

function f() {}

f.apply({},{});
f.apply({},{length:null});
f.apply({},{length:undefined});
f.apply({},{length:0.5});

print("pass");
