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

var toStrings;
var valueOfs;
var toStringCalled;
var valueOfCalled;

toStrings =
[
    {},
    function ()
    {
        toStringCalled = true;
        return {};
    },
    function ()
    {
        toStringCalled = true;
        return undefined;
    },
    function ()
    {
        toStringCalled = true;
        return "hi";
    }
];

valueOfs =
[
    {},
    function ()
    {
        valueOfCalled = true;
        return {};
    },
    function ()
    {
        valueOfCalled = true;
        return undefined;
    },
    function ()
    {
        valueOfCalled = true;
        return "hi";
    },
    function ()
    {
        valueOfCalled = true;
        return "1/1/1970 1:00 am";
    },
    function ()
    {
        valueOfCalled = true;
        return "84";
    },
    function ()
    {
        valueOfCalled = true;
        return 37;
    }
];

for (var ts in toStrings)
{
    for (var vo in valueOfs)
    {
        toStringCalled = false;
        valueOfCalled = false;

        var obj = { toString: toStrings[ts], valueOf: valueOfs[vo] };

        WScript.Echo("=== Implicit toString ===");
        try
        {
            WScript.Echo("" + obj);
        }
        catch (ex)
        {
            WScript.Echo("Got error:");
            WScript.Echo("    name:     " + ex.name);
            WScript.Echo("    message:  " + ex.message);
        }
        WScript.Echo("toString called:  " + (toStringCalled ? "yes" : "no"));
        WScript.Echo("valueOf called:   " + (valueOfCalled ? "yes" : "no"));

        WScript.Echo("=== Implicit valueOf ===");
        try
        {
            WScript.Echo(1 * obj);
        }
        catch (ex)
        {
            WScript.Echo("Got error:");
            WScript.Echo("    name:     " + ex.name);
            WScript.Echo("    message:  " + ex.message);
        }
        WScript.Echo("toString called:  " + (toStringCalled ? "yes" : "no"));
        WScript.Echo("valueOf called:   " + (valueOfCalled ? "yes" : "no"));
    }
}
