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


function createObject()
{
    var obj = new Object();
    obj.a = 1;
    obj.b = 2;
    obj.c = 3;
    obj.d = 4;
    return obj;
}

function createObject2()
{
    var obj = new Object();
    obj.e = 1;
    obj.b = 2;
    obj.c = 3;
    obj.d = 4;
    return obj;
}

var testnumber = 1;
// Test initial cache data population
WScript.Echo("test " + testnumber++);
var obj = createObject();
for (var i in obj)
{
    WScript.Echo(i + " = " + obj[i]);
}

// Test using cached data
WScript.Echo("test " + testnumber++);
var obj = createObject();
for (var i in obj)
{
    WScript.Echo(i + " = " + obj[i]);
}

// Test property delete 
WScript.Echo("test " + testnumber++);
var c = 0;
var obj = createObject();
for (var i in obj)
{
    c++;
    WScript.Echo(i + " = " + obj[i]);
    if (c == 2)
    {
        delete obj.d;
    }
}

// Test property delete and add back
WScript.Echo("test " + testnumber++);
var c = 0;
var obj = createObject();
for (var i in obj)
{
    c++;
    WScript.Echo(i + " = " + obj[i]);
    if (c == 2)
    {
        delete obj.d;
    }
    else if (c == 3)
    {
        obj.d = 5;
    }
}

// Test two for in enumerator simultaneously updating the enumerator data cache
WScript.Echo("test " + testnumber++);
var obj = createObject2();

for (var i in obj)
{
    var c = 0;
    for (var j in obj)
    {
        WScript.Echo(i + "," + j);
        if (c == 1)
        {   
            break;
        }
        if (i == j)
        {
            c = 1;
        }
        
    }
}
