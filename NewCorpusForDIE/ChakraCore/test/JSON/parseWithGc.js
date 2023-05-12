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

// Test case for Blue bug 379253
// Construct a json object string with the given number of properties
function GetJSONString(prefix, count)
{
    var buffer = [];    
    for (var i = 0; i < count; i++) {
        buffer.push('"' + prefix + i + '": true');
    }

    return "{ " + buffer.join(',') + " }";
}

var string1 = GetJSONString("prop", 100);
var string2 = GetJSONString("drop", 550);

// Create a JSON object with a 100 properties
var object1 = JSON.parse(string1);

// Clear reference to that object to make its properties eligible for collection
object1 = null;

// Parse a second JSON object, this time with a large number of properties
// This parse has a reviver passed in too to cause an enumeration to occur after parse
var k = 0;
var object2 = JSON.parse(string2, function(key, value) { return k++; });

WScript.Echo("pass");