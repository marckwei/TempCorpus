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
        name: "Symbol.prototype.description API shape",
        body: function () {
            assert.isTrue(Symbol.prototype.hasOwnProperty('description'), "Symbol.prototype has a 'description' property");
            
            var descriptor = Object.getOwnPropertyDescriptor(Symbol.prototype, 'description');
            assert.areEqual(undefined, descriptor.writable, "writable(description) isn't set");
            assert.isFalse(descriptor.enumerable, "enumerable(description) must be false");
            assert.isTrue(descriptor.configurable, "configurable(description) must be true");
            
            assert.areEqual('function', typeof descriptor.get, "Symbol.prototype.description is an accessor with a getter");
            assert.areEqual(0, descriptor.get.length, "Symbol.prototype.description getter has length 0");
            assert.areEqual("get description", descriptor.get.name, "Symbol.prototype.description getter has name 'get description'");
            assert.areEqual(undefined, descriptor.set, "Symbol.prototype.description has no setter");
        }
    },
    {
        name: "Symbol.prototype.description functionality",
        body: function () {
            assert.areEqual('foo', Symbol('foo').description);
            assert.areEqual('', Symbol('').description);
            assert.areEqual('null', Symbol(null).description);
            
            // Symbol().description === undefined;
            // Should be true but we have a limitation in ChakraCore right now.
            // See ##5833
            assert.areEqual('', Symbol().description);
            assert.areEqual('', Symbol(undefined).description);
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
