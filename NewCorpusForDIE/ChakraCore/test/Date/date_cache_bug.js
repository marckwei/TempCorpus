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

WScript.Echo("Checking for new Date() with DST issues: ");
WScript.Echo("Backward loop starts");
for (var working = new Date(2014, 2, 1) ; working.getFullYear() > 1940;)
{
    var dayOfMonth = working.getDate();
    var nextYear = working.getFullYear();
    var nextMonth = working.getMonth();
    dayOfMonth -= 1;

    working = new Date(nextYear, nextMonth, dayOfMonth);
    if (working.getHours() > 0)
    {
        WScript.Echo("" + working + "  from:" + nextYear + "," + nextMonth + "," + dayOfMonth + "");

        dayOfMonth--;
        working = new Date(nextYear, nextMonth, dayOfMonth); //skip over this date
    }
}

WScript.Echo("Forwards loop starts");
for (var working = new Date(1940, 0, 0) ; working.getFullYear() < 2014;)
{
    var dayOfMonth = working.getDate();
    var nextYear = working.getFullYear();
    var nextMonth = working.getMonth();
    dayOfMonth += 1;

    working = new Date(nextYear, nextMonth, dayOfMonth);

    if (working.getHours() > 0)
    {
        WScript.Echo("" + working + "  from:" + nextYear + "," + nextMonth + "," + dayOfMonth + "");

        dayOfMonth++;
        working = new Date(nextYear, nextMonth, dayOfMonth); //skip over this date
    }
}

WScript.Echo("done.");
