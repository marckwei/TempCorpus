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

// JavaScript source code
WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var handler = {
    getOwnPropertyDescriptor: function (target, name) {
        return emulatedProps[name];
    },
    defineProperty: function (target, name, desc) {

        emulatedProps[name] = desc;
        // $LOG('success: ' + success);
        return success[name];
    },
    preventExtensions: function (target) {
        Object.defineProperties(target, emulatedProps);
        Object.preventExtensions(target);
        return true;
    },
    deleteProperty: function (target, name) {
        delete emulatedProps[name];
        return success[name];
    },
    get: function (target, name, receiver) {
        var desc = emulatedProps[name];
        if (desc === undefined) { return emulatedProto[name]; }
        if ('value' in desc) return desc.value;
        if ('get' in desc) return desc.get.call(target);
    },
    set: function (target, name, value, receiver) {
        return success[name];
    },
    has: function (target, name) {
        return !!emulatedProps[name];
    },
    hasOwn: function (target, name) {
        return !!emulatedProps[name];
    },
    ownKeys: function (target) {
        return Object.getOwnPropertyNames(emulatedProps);
    },
    enumerate: function (target) {
        return Object.getOwnPropertyNames(emulatedProps).filter(function (name) {
            return emulatedProps[name].enumerable;
        });
    }
};

var tests = [
    {
        name: "non-configurable property can't be reported as non-existent",
        body: function () {
            var target = {};
            emulatedProps = {};
            emulatedProps.x = { value: 'test', configurable: false };

            Object.defineProperty(target, 'x', emulatedProps.x);

            var proxy = new Proxy(target, handler); // Checkout handler code at the bottom
            var desc;
            delete emulatedProps.x;

            assert.throws(function () { desc = Object.getOwnPropertyDescriptor(proxy, 'x'); }, TypeError, "Cannot return non-existent for a non-configurable property");
        },
    },
    {
        name: "existing property on non-extensible object cannot be reported as non-existent",
        body: function(){
            var target = {};
            emulatedProps = {};

            target.x = 20;
            Object.preventExtensions(target);
            var desc;
            var proxy = new Proxy(target, handler); // Checkout handler code at the bottom

            assert.throws(function () { desc = Object.getOwnPropertyDescriptor(proxy, 'x'); }, TypeError);
        }
    },
    {
        name: "non existing property on non-extensible object cannot be reported as existent",
        body: function () {
            var target = {};
            emulatedProps = {};
            emulatedProps.x = { value: 1, configurable: false };
            Object.preventExtensions(target);
            var proxy = new Proxy(target, handler);
            assert.throws(function () { Object.getOwnPropertyDescriptor(proxy, 'x') }, TypeError);
        }
    },
    {
        name:'configurable property cannot be reported as non-configurable',
        body: function () {
            var target = {};
            emulatedProps = {};
            emulatedProps.x = { value: 1, configurable: false };
            Object.defineProperty(target, 'x', { value: 1, configurable: true });
            var proxy = new Proxy(target, handler);
            assert.throws(function () { desc = Object.getOwnPropertyDescriptor(proxy, 'x') }, TypeError, "configurable property cannot be reported as non-configurable");
        }
    },
    {
        name: "a non-existent property cannot be reported as non-configurable",
        body: function() {
            emulatedProps = {};
            var target = {};
            Object.defineProperty(emulatedProps, 'y', { value: 'test', configurable: 'false' });
            var proxy = new Proxy(target, handler);
            assert.throws(function () { var desc = Object.getOwnPropertyDescriptor(proxy, 'y') }, TypeError, "a non-existent property cannot be reported as non-configurable");
        }
    },
    {
        name: "can't add property on non-extensible object.",
        body: function () {
            var target = {};
            Object.preventExtensions(target);
            emulatedProps = {};
            emulatedProps.x = 5;
            var proxy = new Proxy(target, emulatedProps);
            success = function () { };
            assert.throws(function () { Object.defineProperty(proxy, 'x', { value: 20 }) }, TypeError);
        },
    },
    {
        name: "target property must be non-configurable after set as such in proxy #1",
        body: function () {
            var target = {};
            emulatedProps = {};
            var proxy = new Proxy(target, handler);
            success = function () { };
            success.x = 21;
            assert.throws(function () { Object.defineProperty(proxy, 'x', { value: 20, configurable: false }) }, TypeError);
        },
    },
    {
        name: "target property must be non-configurable after set as such in proxy #2",
        body: function () {
            var target = {};
            emulatedProps = {};
            emulatedProps.x = 5;
            var proxy = new Proxy(target, handler);
            Object.defineProperty(target, 'x', { value: 41, configurable: true });
            success = function () { };
            success.x = 21;

            assert.throws(function () { Object.defineProperty(proxy, 'x', { value: 20, configurable: false }) }, TypeError);
        },
    },

];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });


