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

var x = [1, 2, 3, 4, 5, 6, 7, 8]
WScript.Echo(x.slice(9,11));
WScript.Echo(x.slice(1, "abc", 5, 9));
WScript.Echo(x.slice());
WScript.Echo(x.slice(3));
WScript.Echo(x.slice(9));
WScript.Echo(x.slice(-19));
WScript.Echo(x.slice(-7, 4));
WScript.Echo(x.slice(2, -4));
WScript.Echo(x.slice(5, 2));
WScript.Echo(x.slice(-12, -9));
WScript.Echo(x.slice(-12, -15));


var large = new Array(1000000);
for (var i = 0; i < large.length; i++)
{
    large[i] = 0;
}

s = large.slice(0, large.length - 1);

WScript.Echo(s.length);



