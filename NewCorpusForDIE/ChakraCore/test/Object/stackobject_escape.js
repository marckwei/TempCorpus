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


var leak;
var c = 0;
function Ctor()
{
    this.b = 2;
    this.a = c + c;
}

function test1()
{
    var a = new Ctor();
    return a + a;
}

WScript.Echo(test1());
WScript.Echo(test1());
Ctor.prototype.valueOf = function() { leak = this; return 40; }

WScript.Echo(test1());
WScript.Echo(leak.a);
WScript.Echo(leak.b);


function test2()
{
    var a = new Ctor();
    var f = a.a;
    var g = a.b;
    return f + g + a.a;
}


WScript.Echo(test2());
WScript.Echo(test2());
Object.defineProperty(Ctor.prototype, "b", { get: function() {  WScript.Echo("get"); return 3; }, set: function() { leak = this; WScript.Echo("set");} });
WScript.Echo(test2());

WScript.Echo(leak.a);
WScript.Echo(leak.b);




function test3()
{
    var a = [ 1 ];
    a[1] = 2; 
    return a[0] + a[1];
}


WScript.Echo(test3());
WScript.Echo(test3());
Object.defineProperty(Array.prototype, "1" , { get: function() { WScript.Echo("get"); return 4; }, set: function() { leak = this; WScript.Echo("set"); }});
WScript.Echo(test3());

WScript.Echo(leak[0]);
WScript.Echo(leak[1]);
