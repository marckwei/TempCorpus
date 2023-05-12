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

function verify(act,exp,msg)
{
    if(act!=exp)
        WScript.Echo(act + " " + msg);
    else
        WScript.Echo("pass");
};

var myobj = { a: "apple", 101: 1 }

verify (myobj.propertyIsEnumerable('a'), true, "property should be enumerable");
verify (myobj.propertyIsEnumerable(101), true, "numeric property should be enumerable");
verify (myobj.propertyIsEnumerable("101"), true, "numeric property should be enumerable");
verify (myobj.propertyIsEnumerable("10"), false, "non-existent numeric property should not be enumerable");

for (o in myobj)
{
    verify (myobj.propertyIsEnumerable(o), true, "for...in loop propertyIsEnumerable enum testing");
}
