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

var requestGlobal = WScript.LoadScriptFile("TypePropertyCache_CrossContext_RequestContext.js", "samethread");

// Access 'o.p' (property on the object) from a different script context
var o = [
    { p: "000" },
    { p: "001", q: 0 },
    { p: "002" },
    { p: "003", q: 0 }
];
for(var i = 0; i < o.length; ++i)
    WScript.Echo(requestGlobal.access(o[i]));

// Access 'o.p' (property on the prototype object) from a different script context
var proto = o;
o = [];
for(var i = 0; i < proto.length; ++i)
    o.push(Object.create(proto[i]));
for(var i = 0; i < o.length; ++i)
    o[i].p;
for(var i = 0; i < o.length; ++i)
    WScript.Echo(requestGlobal.access(o[i]));
