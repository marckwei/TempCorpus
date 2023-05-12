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

WScript.Echo("test1: nested setter without getter");

function top1() {
    var xx = new Object();
    Object.defineProperty(xx, "yy", { set: function(val) {WScript.Echo("in nested setter1"); this.val = 10;} });
    var z = function() {
       xx.yy = 20;
       WScript.Echo(xx.yy);
    }
    return z;
}

var foo = top1();
foo();
WScript.Echo("test2: nested setter and setter");
function top2() {
    var xx = new Object();
    Object.defineProperty(xx, "yy", { get: function() { return this; },
    set: function(val) {WScript.Echo("in nested setter2"); this.val = 11;} });
    var z = function() {
       xx.yy = 20;
       WScript.Echo(xx.yy);
       WScript.Echo(xx.yy.val);
    }
    return z;
}

var foo2 = top2();
foo2();

WScript.Echo("test3: nested setter and setter from this");
function top3() {
    Object.defineProperty(this, "yy", { get: function() { return this; },
    set: function(val) {WScript.Echo("in nested setter3"); this.val = 12;} });
    var z = function() {
       yy = 20;
       WScript.Echo(yy);
       WScript.Echo(yy.val);    }
    return z;
}

var foo3 = top3();
foo3();

WScript.Echo("test4: closure and with");

var withObj = new Object();
Object.defineProperty(withObj, "tt", { get: function() { return this; },
    set: function(val) {WScript.Echo("in nested setter3"); this.val = 13;} });

function top4(inVar) {
    with (inVar)
    {
    Object.defineProperty(this, "tt", { get: function() { return this; },
    set: function(val) {WScript.Echo("in nested setter3"); this.val = 14;} });
    var z = function() {
       tt = 20;
       WScript.Echo(tt);
       WScript.Echo(tt.val);    }
    return z;
    }
}

var foo4 = top4(withObj);
foo4();
