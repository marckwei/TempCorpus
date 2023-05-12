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

function returnTrue(x,y,z)
{
    WScript.Echo("value:"+ x + " index:" + y + " Object:" + z);
    return true;
}

function returnFalse(x,y,z)
{
    WScript.Echo("value:"+ x + " index:" + y + " Object:" + z);
    return false;
}

function returnRandom(x,y,z)
{
    WScript.Echo("value:"+ x + " index:" + y + " Object:" + z);
    return y!=1;
}

Array.prototype[6] = 20;

var x = [1,2,3,4,5];
var y = x.forEach(returnTrue,this);
WScript.Echo(y);

x = [10,20,30,40,50];
y = x.forEach(returnFalse, this);
WScript.Echo(y);

x = [10,20,30,40,50];
y = x.forEach(returnRandom, this);
WScript.Echo(y);

x = {0: "abc", 1: "def", 2: "xyz"}
x.length = 3;

y = Array.prototype.forEach.call(x, returnTrue,this);
WScript.Echo(y);

y = Array.prototype.forEach.call(x, returnFalse,this);
WScript.Echo(y);

y = Array.prototype.forEach.call(x, returnRandom, this);
WScript.Echo(y);

x = [10,20,30,40,50];
x[8] = 10;
y = x.forEach(returnTrue, this);
WScript.Echo(y);
