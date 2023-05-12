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

function write(v) { WScript.Echo(v); }

var a;

a = new Array();
write(a.length);

a = new Array(10);
write(a.length);

a = new Array(new Number(10.2));
write(a.length);
write(a[0]);

a = new Array(new Array());
write(a.length);

var wo = new Object();
wo.valueOf = function() {return 12}
var we = [1, 2, 3];
we.length = "33";
write(we.length);
we.length = wo;
write(we.length);
we.length = null;
write(we.length);
try {
we.length = undefined;
write(we.length);
}
catch (e) {
    write(e.message);
}
try {
we.length = "foo";
}
catch (e) {
    write(e.message);
}
WScript.Echo(we.length);
try {
    we.length = Infinity;
    write(we.length);
}
catch (e) {
    write(e.message);
}