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

// Object.prototype.toLocaleString tests for ES6 behaviors

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var toLocaleString = Object.prototype.toLocaleString;

var tests = [
    {
        name: "Simple error cases for Object#toLocaleString",
        body: function () {
            assert.throws(function() { toLocaleString.call(); }, TypeError, "Object#toLocaleString throws when called with no parameters", "Object.prototype.toLocaleString: 'this' is null or undefined");
            assert.throws(function() { toLocaleString.call(undefined); }, TypeError, "Object#toLocaleString throws when called with undefined this parameter", "Object.prototype.toLocaleString: 'this' is null or undefined");
            assert.throws(function() { toLocaleString.call(null); }, TypeError, "Object#toLocaleString throws when called with null this parameter", "Object.prototype.toLocaleString: 'this' is null or undefined");
        }
    },
    {
        name: "Corner error cases for Object#toLocaleString",
        body: function () {
            var o = { toString : 'non-object' };
            assert.throws(function() { toLocaleString.call(o); }, TypeError, "Object#toLocaleString tries to get the 'toString' property from the this parameter of object with non-object toString property", "Object.prototype.toLocaleString: argument is not a Function object");

            o = { get toString() { throw TypeError('get toString'); } };
            assert.throws(function() { toLocaleString.call(o); }, TypeError, "Object#toLocaleString tries to get the 'toString' property from the this parameter of object with throwing accessor toString property", "get toString");
            
            o = { get toString() { return 'non-object'; } };
            assert.throws(function() { toLocaleString.call(o); }, TypeError, "Object#toLocaleString tries to get the 'toString' property from the this parameter of object with accessor toString property which returns non-function", "Object.prototype.toLocaleString: argument is not a Function object");
            
            o = Object.create(null); // o doesn't have Object.prototype.toString
            assert.throws(function() { toLocaleString.call(o); }, TypeError, "Object#toLocaleString tries to get the 'toString' property from the this parameter of object without toString property", "Object.prototype.toLocaleString: argument is not a Function object");
            
            o = { 
                toString() { 
                    assert.areEqual(o, this, "This argument passed to toString function should be the same object passed to toLocaleString");
                    throw TypeError('toString'); 
                } 
            };
            assert.throws(function() { toLocaleString.call(o); }, TypeError, "Object#toLocaleString tries to call the 'toString' property from the this parameter of object with toString function that throws", "toString");
        }
    },
    {
        name: "Object#toLocaleString passes the this argument as-is to the toString function we load from ToObject(this)",
        body: function () {
            'use strict';
            Boolean.prototype.toString = function() { return typeof this; }; // we will walk up to here from Object(true) before we find Object.prototype.toString
            assert.areEqual('boolean', true.toLocaleString(), "Calling Object#toLocaleString with a primitive this argument performs ToObject(this).toString.call(this) which will call the function we added to Boolean#toString");
            assert.areEqual('boolean', toLocaleString.call(false), "Calling Object#toLocaleString with a primitive this argument performs ToObject(this).toString.call(this) which will call the function we added to Boolean#toString - even if we apply/call it");
            
            assert.areEqual('5', toLocaleString.call(5), "Calling Object#toLocaleString with a primitive this argument performs ToObject(this).toString.call(this) which will call Object#toString(5)");
            
            Object.defineProperty(Boolean.prototype, "toString", { get: function() { return () => typeof this; }});
            assert.areEqual('boolean', true.toLocaleString(), "Calling Object#toLocaleString with a primitive this argument performs ToObject(this).toString.call(this) which will call the function we added to Boolean#toString");
            assert.areEqual('boolean', toLocaleString.call(false), "Calling Object#toLocaleString with a primitive this argument performs ToObject(this).toString.call(this) which will call the function we added to Boolean#toString - even if we apply/call it");
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
