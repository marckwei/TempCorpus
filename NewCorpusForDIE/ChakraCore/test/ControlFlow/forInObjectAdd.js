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

function write(args)
{
   if(typeof(WScript) == "undefined")
      print(args);
   else
     WScript.Echo(args);
}

write("Scenario 1: Adding properties on the fly");
var x = { a: 1, b: 2};

for(var i in x)
{
    if(x[i] == 2)
    {
        x.c = 3;
        x.d = 4;
    }

    write(x[i]);
}

write("Scenario 2: Large number of properties in forin");
var largeObj = {};
for(var k=0; k < 25; k++)
{
   largeObj["p"+k] = k + 0.3;
}

for(var i in largeObj)
{
    write(largeObj[i]);
}

write("Sceanrio 3: Nested Forin");
var outerObj = { a: 3, b: 4, c: 5 };
var innerObj = { a: 3, b: 4, c: 5 };
for(var i in outerObj)
{
   write(i);
   for(var j in innerObj)
   {
       write(j);
   }
}

write("Scenario 4: Properties and numerical indices in object");
var objWithNumber= { a: 12, b: 13, c:23 };
objWithNumber[13] = "Number13";
objWithNumber[15] = "Number15";

for(var i in objWithNumber)
{
    write(objWithNumber[i]);
}

var undef;

for(var i in undef)
{
   write("FAILED: Entering enumeration of undefined");
}

var nullValue = null;

for(var i in nullValue)
{
   write("FAILED: Entering enumeration of null value");
}

var integer = 3;

for(var i in integer)
{
   write("FAILED: Entering enumeration of integer");
}

var double = 3.4;

for(var i in double)
{
   write("FAILED: Entering enumeration of double");
}
