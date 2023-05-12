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

// Make sure we invalidate missing property caches, if the property is shadowed on the proto chain.  Also verify it all works with object type specialization.
var SimpleObject = function () {
    this.a = 1;
    this.b = 2;
}

var p = {};
SimpleObject.prototype = p;

var o = new SimpleObject();

function test() {
    var a = o.a;
    var b = o.b;
    var m = o.m;
    WScript.Echo("o.m = " + m);
}

// Run once, walk the proto chain on the slow path not finding property v anywhere, cache it.
test();
// Time to do simple JIT
// From JIT-ed code retrieve the value of v (undefined) from the missing property cache.
test();
// Time to do full JIT (including object type specialization).
// From JIT-ed code retrieve the value of v (undefined) from the missing property cache.
test();
// Now add the property to the prototype, which should invalidate the cache, and force bailout from JIT-ed code.
p.m = 0;
// Verify we get the new value now.
test();

