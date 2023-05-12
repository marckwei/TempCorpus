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

var x = 6;
var giraffe = 8;
var zebra = x + giraffe;
function f(t) {
    return t + t;
}
var cat = f(zebra);
rat = cat * 2;
do {
    rat = rat - 3;
    cat = cat + 4;
}
while (rat > 4);
var dragon = rat / 2;

WScript.Echo(x)
WScript.Echo(giraffe)
WScript.Echo(zebra)
WScript.Echo(cat)
WScript.Echo(rat)
WScript.Echo(dragon);

do 
{
   WScript.Echo("Should print once - 0");
}
while(0);

do 
{
   WScript.Echo("Should print once - false");

}
while(false);

a: do 
{
   WScript.Echo("Should print once - label");
   do 
   {
      break a;
   }while(false);
   WScript.Echo("Should not print");
}
while(false);
