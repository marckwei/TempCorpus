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
// Copyright (C) Microsoft Corporation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function assertEquals(expected, actual) {
    if (expected != actual) {
        throw `Expected ${expected}, received ${actual}`;
    }
}

function wasmAlloc(initialSize, newSize) {

    const n = 5;
    const ONE_GB_IN_PAGES = 0x4000;
    const instances = [];

    const module = new WebAssembly.Module(readbuffer('oom.wasm'));
    const sizeInBytes = initialSize * (1 << 16) /*64K*/;

    for (let i = 0; i < n; i++) {
            let memObj = new WebAssembly.Memory({initial:initialSize, maximum: ONE_GB_IN_PAGES});
            assertEquals(sizeInBytes, memObj.buffer.byteLength);
            let instance = new WebAssembly.Instance(module, { "dummy" : { "memory" : memObj } }).exports;
            assertEquals(initialSize, instance.size());

            let result = instance.grow(newSize);
            if (result == -1) {
                return 0;
            }

            instances.push(instance);
    }

    return 1;
}

assertEquals(2, WScript.Arguments.length);

const INITIAL_SIZE = parseInt(WScript.Arguments[0]);
const GROW_SIZE = parseInt(WScript.Arguments[1]);

assertEquals(0, wasmAlloc(INITIAL_SIZE, GROW_SIZE));
print ("PASSED");
