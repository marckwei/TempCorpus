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

function write(v) { WScript.Echo(v + ""); }

var obj = [];
var proto = [];
var count = 2;

for(var i = 0; i < count; ++i)
{
    obj[i] = (new (g=function f() { this.x=3; })());
    proto[i] = g;
}

for(var i = 0; i < count; ++i)
{
    write("Testing object " + i + "............");

    for(var j = 0; j < count; ++j)
    {
        write("obj[" + i + "] instanceof proto[" + j + "] : " + (obj[i] instanceof proto[j]));
    }
}

proto[0].prototype.z = "proto[0].z";
proto[0].prototype.w = "proto[0].w";

write("Checking properties .........");
for(var i = 0; i < count; ++i)
{
    write("obj[" + i + "].z : " + obj[i].z);
    write("obj[" + i + "].w : " + obj[i].w);
}

var a = function x() {
    function foo() {
        "use strict";
        x = 1;
    };
};

(function __f_997(__v_4351 = function () {
        WScript.Echo('pass');
        return __f_997;
    }()) {
    function __f_997() {}
})();
