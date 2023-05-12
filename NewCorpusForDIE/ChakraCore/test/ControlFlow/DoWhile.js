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

// Use do..while as a statement inside if..else
var str="if (1) do WScript.Echo(1); while (false); else 1;";

try
{
    eval(str);
}
catch (e)
{
    WScript.Echo(e);
}

// Use do..while as a statement inside another do..while
str="do do WScript.Echo(2); while (false); while(false);"
try
{
    eval(str);
}
catch (e)
{
    WScript.Echo(e);
}

// do..while without a semicolon at the end, followed by another statement
// do while surrounds a statement without a semicolon, but ended with a newline
var a = 10;
do
  WScript.Echo(3)
while (false)
var b=20;

with(a) do WScript.Echo(4); while (false)

for(var i=0; i<5; i++)
  do
    WScript.Echo("5."+i);
  while(false)

// do..while as the last statement ended by EOF
do
  WScript.Echo(6)
while (false)
