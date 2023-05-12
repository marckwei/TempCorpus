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

function foo() {
    // override global accessor property 'foo' with a function
    // this should convert the property to a data property with
    // writable true, enumerable true, configurable false
}
eval("function bar() { /* same deal except for eval defined global functions configurable will be true */ }");

(function verifyGlobalPropertyDescriptors() {
    var d = Object.getOwnPropertyDescriptor(this, 'foo');

    assertPropertyDoesNotExist(d, 'get');
    assertPropertyDoesNotExist(d, 'set');
    assertPropertyExists(d, 'configurable', false);
    assertPropertyExists(d, 'enumerable', true);
    assertPropertyExists(d, 'writable', true);
    assertPropertyExists(d, 'value', foo);

    d = Object.getOwnPropertyDescriptor(this, 'bar');

    assertPropertyDoesNotExist(d, 'get');
    assertPropertyDoesNotExist(d, 'set');
    assertPropertyExists(d, 'configurable', true);
    assertPropertyExists(d, 'enumerable', true);
    assertPropertyExists(d, 'writable', true);
    assertPropertyExists(d, 'value', bar);
}).call(this);

try {
    eval("function nonConfigurableBar() { /* try to override non-configurable global accessor property with a function definition */ }");
} catch (e) {
    if (!(e instanceof TypeError) || e.message != "Cannot redefine non-configurable property 'nonConfigurableBar'")
        throw e;
}
