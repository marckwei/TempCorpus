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

//
// Tests the relationship between a parent and child object.
//

function print(x,str)
{
    WScript.Echo("=== " + str + " ===");
    WScript.Echo("x.q:    " + x.q);
    WScript.Echo("x[3]:   " + x[3]);
    WScript.Echo("x[4]:   " + x[4]);
    WScript.Echo("x[50]:  " + x[50]);
    WScript.Echo("x.p1:   " + x.p1);
    WScript.Echo("x.p2:   " + x.p2);
    WScript.Echo("x[\"m\"]: " + x["m"]);
    WScript.Echo("");
}

var z = new Array(10);

for(var i = 0; i < 10; ++i)
{
    z[i] = i;
}
z.p1 = "test";
z.p2 = 3;

function F(x)
{
    this[x] = 1;
}
F.prototype = z;

var x = new F("q");

print(x, "after object creation");

z.m = 14;
print(x, "after adding new property to parent");

F.prototype = new String("glah");
print(x, "after modifying constructor's prototype");

z.m--;
print(x, "after modifying parent");

z.p1 = undefined;
z[3] = undefined;
z[4] <<= 2;
z[50] = 42;
print(x, "after undefining properties on parent");

z.p1 = new String("new p1");
print(x, "after re-adding property on parent");

x.p1 = "x's p1";
z.p1 = undefined;
print(x, "after re-defining property on object");
