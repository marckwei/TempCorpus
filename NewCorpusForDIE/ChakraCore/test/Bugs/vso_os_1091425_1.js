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

(function addAccessorPropertiesToGlobal() {
    var getter = function () { throw new Error("This getter should not get called"); };
    var setter = function () { throw new Error("This setter should not get called"); };

    Object.defineProperty(this, "foo", {
        get: getter,
        set: setter,
        configurable: true
    });

    Object.defineProperty(this, "bar", {
        get: getter,
        set: setter,
        configurable: true
    });

    Object.defineProperty(this, "nonConfigurableFoo", {
        get: getter,
        set: setter,
        configurable: false
    });

    Object.defineProperty(this, "nonConfigurableBar", {
        get: getter,
        set: setter,
        configurable: false
    });

    // double check that the property is added as expected according to spec
    var d = Object.getOwnPropertyDescriptor(this, "foo");

    assertPropertyExists(d, 'get', getter);
    assertPropertyExists(d, 'set', setter);
    assertPropertyExists(d, 'configurable', true);
    assertPropertyExists(d, 'enumerable', false);
    assertPropertyDoesNotExist(d, 'writable');
    assertPropertyDoesNotExist(d, 'value');

    d = Object.getOwnPropertyDescriptor(this, "bar");

    assertPropertyExists(d, 'get', getter);
    assertPropertyExists(d, 'set', setter);
    assertPropertyExists(d, 'configurable', true);
    assertPropertyExists(d, 'enumerable', false);
    assertPropertyDoesNotExist(d, 'writable');
    assertPropertyDoesNotExist(d, 'value');

    var d = Object.getOwnPropertyDescriptor(this, "nonConfigurableFoo");

    assertPropertyExists(d, 'get', getter);
    assertPropertyExists(d, 'set', setter);
    assertPropertyExists(d, 'configurable', false);
    assertPropertyExists(d, 'enumerable', false);
    assertPropertyDoesNotExist(d, 'writable');
    assertPropertyDoesNotExist(d, 'value');

    var d = Object.getOwnPropertyDescriptor(this, "nonConfigurableBar");

    assertPropertyExists(d, 'get', getter);
    assertPropertyExists(d, 'set', setter);
    assertPropertyExists(d, 'configurable', false);
    assertPropertyExists(d, 'enumerable', false);
    assertPropertyDoesNotExist(d, 'writable');
    assertPropertyDoesNotExist(d, 'value');
}).call(this);
