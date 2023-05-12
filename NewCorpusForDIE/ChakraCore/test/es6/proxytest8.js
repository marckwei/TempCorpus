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

var str = new String('testing contains');
var p = new Proxy(str, {});
// Object.defineProperty(p, "toString", {value : function(arg) { print('proxys toString'); return "b"; }});
Object.defineProperty(p, "valueOf", {value : function(arg) { print('proxys valueOf'); return "c"; }});
print(p + "a");

var n = new Number(100);
var p1 = new Proxy(n, {});
Object.defineProperty(p1, "valueOf", {value : function(arg) { print('proxys valueOf'); return 10; }});
print(p1 + 5);

try{
    var p2 = new Proxy(new Number(5), {});
    p2 + 5;
} catch (e) {
        if (!(e instanceof TypeError) || e.message !== "Number.prototype.valueOf: 'this' is not a Number object") {
            $ERROR(e);
        }
 }
 print('PASS');
