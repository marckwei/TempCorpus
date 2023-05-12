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

WScript.Echo('hello');
var a = WScript.GetWorkingSet();
WScript.Echo("workingset = " + a.workingSet);
WScript.Echo("maxworkingset = " + a.maxWorkingSet);
WScript.Echo("pagefaultcount = " + a.pageFault);
WScript.Echo("private usage = " + a.privateUsage);

function print(obj, name)
{
  WScript.Echo("print object " + name);
  for (i in obj)
  {
    WScript.Echo(i + ' = ' + obj[i]);
  }
}

var c = Debug.getHostInfo();
print(c, "hostinfo");

var d = Debug.getMemoryInfo();
for (i in d)
{
print(d[i], i);
}

var b = Debug.getWorkingSet();
WScript.Echo("workingset = " + b.workingSet);
WScript.Echo("maxworkingset = " + b.maxWorkingSet);
WScript.Echo("pagefaultcount = " + b.pageFault);
WScript.Echo("private usage = " + b.privateUsage);
