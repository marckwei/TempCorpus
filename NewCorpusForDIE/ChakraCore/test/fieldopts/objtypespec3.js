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

Object.prototype.prop0 = 100;
Object.prototype.method0 = function () { return 100; }

function SimpleObject() {
}

function test1a(o) {
    return o.prop0;
}
WScript.Echo(test1a(new SimpleObject()));
WScript.Echo(test1a(new SimpleObject()));
WScript.Echo(test1a(new SimpleObject()));
WScript.Echo(test1a(1));

function test1b(o) {
    return o.method0();
}
WScript.Echo(test1b(new SimpleObject()));
WScript.Echo(test1b(new SimpleObject()));
WScript.Echo(test1b(new SimpleObject()));
WScript.Echo(test1b(1));

function test2a(o) {
    return o.prop0;
}
WScript.Echo(test2a(new SimpleObject()));
WScript.Echo(test2a(new SimpleObject()));
WScript.Echo(test2a(new SimpleObject()));
WScript.Echo(test2a(0.5));

function test2b(o) {
    return o.method0();
}
WScript.Echo(test2b(new SimpleObject()));
WScript.Echo(test2b(new SimpleObject()));
WScript.Echo(test2b(new SimpleObject()));
WScript.Echo(test2b(0.5));

function test3a(o) {
    return o.prop0;
}
WScript.Echo(test3a(new SimpleObject()));
WScript.Echo(test3a(new SimpleObject()));
WScript.Echo(test3a(new SimpleObject()));
WScript.Echo(test3a(Math.max(0x5a827999, -262144)));

function test3b(o) {
    return o.method0();
}
WScript.Echo(test3b(new SimpleObject()));
WScript.Echo(test3b(new SimpleObject()));
WScript.Echo(test3b(new SimpleObject()));
WScript.Echo(test3b(Math.max(0x5a827999, -262144)));

function test4a(o) {
    return o.prop0;
}
WScript.Echo(test4a(new SimpleObject()));
WScript.Echo(test4a(new SimpleObject()));
WScript.Echo(test4a(new SimpleObject()));
WScript.Echo(test4a(Math.max(0.5, -262144)));

function test4b(o) {
    return o.method0();
}
WScript.Echo(test4b(new SimpleObject()));
WScript.Echo(test4b(new SimpleObject()));
WScript.Echo(test4b(new SimpleObject()));
WScript.Echo(test4b(Math.max(0.5, -262144)));
