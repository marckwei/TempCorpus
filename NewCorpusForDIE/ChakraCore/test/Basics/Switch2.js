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

var x = { i : 1, j : 2, k : 3 };

switch(x.i)
{
        case "1":
                WScript.Echo("error - found \"1\"");
                break;
        default:
                WScript.Echo("error - found default");
                break;
        case 1.000000001:
                WScript.Echo("error - found 1.000000001");
                break;
        case 1:
                WScript.Echo("found 1");
                break;
}

switch(x.q)
{
        case undefined:
                WScript.Echo("found undefined");
                break;
        default:
                WScript.Echo("found a value");
}

x.f = function() { this.j++; return this.j; }
q();
function q() {
        switch(x.j)
        {
                case 1:
                        WScript.Echo("error - found 1");
                        return;
                case x.f():
                        WScript.Echo("error - found x.f()");
                        return;
                case 2:
                        WScript.Echo("found 2, x.j = " + x.j);
                        return;
                case 3:
                        WScript.Echo("error - found 3");
                        return;
        }
}

var y = new Object();
y.z = x;
y.w = x;

switch(x)
{
        case y.w:
                WScript.Echo("found y.w");
                break;
        case y.z:
                WScript.Echo("found y.z");
                break;
}
