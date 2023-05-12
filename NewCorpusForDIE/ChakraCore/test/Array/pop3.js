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


function test(a)
{
    a = a.pop();
    return a;
}
var arr = [ { a : 3 }];
var r = test(arr);
WScript.Echo(r.a);

arr = [ { a: 3 }];
r = test(arr);
WScript.Echo(r.a);

// Test that popping a gap accesses the prototype chain

function f(a) {
    while (a.length > 0)
        a.pop();
}

f(['x',,'x']);
Object.defineProperty(Object.prototype,"1",{get: function(){ WScript.Echo("getter"); }, configurable:true});
f(['x',,'x']);

function f_float(a) {
    while (a.length > 0)
        a.pop();
}

delete Object.prototype[1];
var x = [1.2];
x[3] = 1.4;
f_float(x);
Object.defineProperty(Object.prototype,"1",{get: function(){ WScript.Echo("getter"); }, configurable:true});
x = [1.1];
x[2] = 1.3;
f_float(x);

