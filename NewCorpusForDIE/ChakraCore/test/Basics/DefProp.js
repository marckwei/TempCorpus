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

function def_prop_array()
{
    var array = [];
    Object.defineProperty(array, 0, { get: function() { WScript.Echo("array[0]"); } });

    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += array[0];

    }
}

function def_prop_object()
{
    var object = {};
    Object.defineProperty(object, "sum", { get: function() { WScript.Echo("sum"); } });

    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += object.sum;
    }
}

function def_props_array()
{
    var array = [];
    Object.defineProperties(array,
                            {
                                0: { get: function() { WScript.Echo("array[0]"); } },
                                1: { get: function() { WScript.Echo("array[1]"); } }
                            });

    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += array[0];
    }
}

function def_props_object()
{
    var object = {};
    Object.defineProperties(object, 
                            {
                                sum1: { get: function() { WScript.Echo("sum1"); } },
                                sum2: { get: function() { WScript.Echo("sum2"); } }
                            });

    var sum = 0;
    for (var i = 0; i < 3; i++)
    {
        sum += object.sum1;
    }
}

function def_props_number()
{
  function diag() {
    WScript.Echo("Type: " + (typeof this));
    WScript.Echo("  Is Object: " + (this instanceof Object));
    WScript.Echo("  Is Number: " + (this instanceof Number));
  }

  Object.defineProperty(
    Number.prototype,
    "foo",
    {
        set: diag
    });

  Object.defineProperty(
    Number.prototype,
    "42",
    {
        set: diag
    });

  var runTests = function(obj) {
    WScript.Echo("** Testing property 'foo'");
    obj.foo = {};
    WScript.Echo("");

    WScript.Echo("** Testing property 42");
    obj[42] = {};
    WScript.Echo("");
  }

  var i = 3;
  runTests(i);

  var d = 3.14;
  runTests(d);
}

function main()
{
    def_prop_array();
    def_prop_object();
    def_props_array();
    def_props_object();
    def_props_number();
}

main();
