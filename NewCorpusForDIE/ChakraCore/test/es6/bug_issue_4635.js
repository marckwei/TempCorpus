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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Named function expression should have a name property even if it's being assigned to an object property",
    body: function () {
        var obj = {};
        obj.a = class A { };
        assert.areEqual('A', obj.a.name, "Since the class expression is named, it should have a name property");
    }
  },
  {
    name: "Unnamed function expression should have an empty name property",
    body: function () {
        var obj = {};
        obj.a = class { };
        assert.areEqual('', obj.a.name, "Since the class expression is unnamed, it should have an empty name property");
    }
  },
  {
    name: "Instance of a named function expression",
    body: function () {
        var obj = {};
        obj.a = class A { 
            n() { return this.constructor.name; }
        };
        var a = new obj.a();
        assert.areEqual('A', a.constructor.name, "Constructor should be class itself which should have a name property");
        assert.areEqual('A', a.n(), "Name property lookup via instance method");
    }
  },
  {
    name: "Instance of an unnamed function expression",
    body: function () {
        var obj = {};
        obj.a = class {
            n() { return this.constructor.name; }
        };
        var a = new obj.a();
        assert.areEqual('', a.constructor.name, "Constructor should be class itself which should have an empty name property");
        assert.areEqual('', a.n(), "Name property lookup via instance method");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
