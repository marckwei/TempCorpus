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

var d = new Date();

d.setDate(12345678);
d.setTime(456789);

WScript.Echo("toISOString : " + d.toISOString());
WScript.Echo("toJSON : " + d.toJSON());


// Test NaN Date value
d = new Date(Number.NaN);
try
{
   d.toISOString();
} catch(e) {
    WScript.Echo("NaN Date toISOString: " + e.name + " : " + e.message);
}
WScript.Echo("NaN Date toJSON:: " + d.toJSON());

//
// Test Infinity Date value
//
d = new Date(Infinity);
try {
    d.toISOString();
} catch(e) {
    WScript.Echo("Infinity Date toISOString : " + e.name + " : " + e.message);
}
WScript.Echo("Infinity Date toJSON : " + d.toJSON());

//
// Test Date.prototype.toJSON transferred to an object but toISOString is not callable
//
d = {
    toISOString: 1,
    toJSON: Date.prototype.toJSON
};
try {
    d.toJSON();
} catch(e) {
    WScript.Echo("Object toISOString not callable : " + e.name + " : " + e.message);
}

//
// Test Date.prototype.toJSON transferred to an object
//
d = {
    toISOString: function() {
        return "Fake JSON : Object";
    },
    toJSON: Date.prototype.toJSON
};
WScript.Echo("Object toJSON : " + d.toJSON());

//
// Test Date.prototype.toJSON transferred to String
//
String.prototype.toISOString = function() {
    return "Fake JSON : " + this;
};
String.prototype.toJSON = Date.prototype.toJSON;
d = "String";
WScript.Echo("String toJSON : " + d.toJSON());

//
// Test Date.getYear -- ES5 spec B.2.4
// 
WScript.Echo("getYear 2000: " + new Date("January 1 2000").getYear());
WScript.Echo("getYear 1899: " + new Date("January 1 1899").getYear());

Object.defineProperty(Date.prototype, "valueOf", {get: function() {WScript.Echo("get fired");}});
var d = new Date();
d.toJSON();
