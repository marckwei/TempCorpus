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

function fieldhoist1()
{
    var object = {};

    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += object.sum;      // hoisted field load
        Object.defineProperty(object, "sum", { get: function() { WScript.Echo("sum" ); }, configurable: true });
        sum += object.sum;      // implicit call bailout
    }
}

function fieldhoist2()
{
    var object = {};

    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += object.sum;      // hoisted field load
        Object.defineProperty(object, "x", { get: function() { WScript.Echo("x"); }, configurable: true });  // kill all fields
        sum += object.sum;      // reload, no bailout
    }
}

function fieldhoist3(name)
{
    var object = { sum: 1};

    Object.defineProperty(object, name, { set: function(val) { WScript.Echo(val); }, configurable: true });
    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += object.sum;      // hoisted field load
        object[name] = object.sum;       // kill all fields
        sum += object.sum;      // reload, no bailout
    }
}

function main()
{
    fieldhoist1();
    fieldhoist2();
    fieldhoist3("x");
}

main();
