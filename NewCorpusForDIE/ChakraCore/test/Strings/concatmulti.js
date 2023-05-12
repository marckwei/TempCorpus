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


var tests = [
function (str)
{
    // Can't optimize
    return "<start> " + str + " <end>";
},

function(str, str2)
{
    // Can't optimize because the first two might not be string
    return str + str2 + " something";
},

function(str, str2)
{
    // Can't optimize, side effect ordering
    return str + " something " + str2;
},

function(str, str2)
{
    // Can't optimize, side effect ordering
    return str + (" something " + str2);
},

function(str)
{
    return ("<start> " + str) 
        + (str + " <end>");
},

function(str)
{
    return "<start> " + str + str + (str += "<extra>") + " <end>";
},

function(str)
{
    return "<start> " + str + str;
}


];


function test(func, str, str2)
{
    WScript.Echo("------------------------------------------");
    WScript.Echo(func(str, str2));
    WScript.Echo(func(str, str2));
}

function alltest(str, str2)
{
    WScript.Echo("==========================================");
    WScript.Echo("Input : " + str + " | " + str2);
    WScript.Echo("==========================================");
    for (var i = 0; i < tests.length; i++)
    {
        test(tests[i], str, str2);
    } 
}

alltest("x");
alltest(12);
alltest(true);


function A() {};
function B() {};
A.prototype.toString = function() { WScript.Echo("A.toString"); return "A"; }
B.prototype.toString = function() { WScript.Echo("B.toString"); return "B"; }


alltest(new A(), new B());
