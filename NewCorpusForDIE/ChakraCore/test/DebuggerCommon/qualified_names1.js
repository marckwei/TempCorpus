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

// Test for fully qualified names

var a = 10;
var k = function() { 
    a;
    a++;/**bp:stack()**/
}
k();


k.subF1 = function() { 
    a;
    a++;/**bp:stack()**/
}
k.subF1();

k.subF1.subsubF1 = function() { 
    a;
    a++;/**bp:stack()**/
}

 var m = k.subF1.subsubF1;
 m();

var k2 = k.subF2 = function () {         
    a;
    a++;/**bp:stack()**/
}
 
 k2();

var k3 = 1;
k.subF3 = k3 = function () {         
    a;
    a++;/**bp:stack()**/
}

k3();

var obj1 = {}
obj1[0] = function () {
    a;
    a++;/**bp:stack()**/
}
obj1[0]();
obj1["test"] = function () {
    a;
    a++;/**bp:stack()**/
}
obj1["test"]();

function returnObj() { return obj1; }
returnObj()[2] = function () {
    a;
    a++;/**bp:stack()**/
}
obj1[2]();

obj1[0][0] = function () {
    a;
    a++;/**bp:stack()**/
}
obj1[0][0]();

WScript.Echo("Pass");
