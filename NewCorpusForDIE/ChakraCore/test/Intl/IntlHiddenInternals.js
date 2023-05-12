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

var collatorExcludeList = [];
var numberFormatExcludeList = [];
var dateTimeFormatExcludeList = [];

function testHiddenInternals(constructor, objType, excludeList) {
    var obj = new constructor();

    var properties = Object.getOwnPropertyNames(obj);
    if (properties.length == 0) return;

    var extraProperties = false;

    properties.forEach(function (prop) {
        if (excludeList.indexOf(prop) !== -1) return;

        if (prop.indexOf("__", 0) === -1) {
            WScript.Echo("Detected additional property '" + prop + "' on '" + objType + "', if property is expected update this test's exclude lists.");
            extraProperties = true;
        }
    });
    if (extraProperties) {
        WScript.Echo("Failed for '" + objType + "'!");
    }
}

testHiddenInternals(Intl.Collator, "Collator", collatorExcludeList);
testHiddenInternals(Intl.NumberFormat, "NumberFormat", numberFormatExcludeList);
testHiddenInternals(Intl.DateTimeFormat, "DateTimeFormat", dateTimeFormatExcludeList);

if(Intl.hasOwnProperty("EngineInterface") === true){
    WScript.Echo("EngineInterface object is not hidden.");
}

WScript.Echo("Pass");
