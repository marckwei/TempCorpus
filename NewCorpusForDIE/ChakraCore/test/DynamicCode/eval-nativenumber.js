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


var funcstr = "var t = function() { var a = 1073741823; var arr = new Array(); ";
for (var i = 0; i < 2048; i++)
{
    funcstr += " arr[0] = a * 2; ";
}
funcstr += "return arr; }";
var keep = new Array();
var scale = 1;
for (var i = 0; i < 20 * scale; i++)
{
    eval("var b = " + i  + "; " + funcstr);
    CollectGarbage();
    var ret = t();
    if (ret[0] != 2147483646) { WScript.Echo("fail"); throw 0;}
    keep.push(ret[0]);
 
    if (i % (5 * scale) == 0) 
    { 
        for (var j = 0; j < keep.length; j++)
        {
            if (keep[j] != 2147483646) { WScript.Echo("fail"); throw 1; }
        }
        keep.length = 0; 

    }
}

WScript.Echo("pass");
