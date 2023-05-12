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

let passed = true;

function assertEquals(expected, actual) {
    if (expected != actual) {
        passed = false;
        throw `Expected ${expected}, received ${actual}`;
    }
}

let check = function(expected, funName, ...args) {
    let fun = eval(funName);
    var result;
    try {
       result = fun(...args);
    }
    catch (e) {
        result = e.name;
    }

    if(result != expected)
    {
        passed = false;
        print(`${funName}(${[...args]}) produced ${result}, expected ${expected}`);
    }
}

const INITIAL_SIZE = 1;
const module = new WebAssembly.Module(readbuffer('stores.wasm'));

let memObj = new WebAssembly.Memory({initial:INITIAL_SIZE});
const instance = new WebAssembly.Instance(module, { "dummy" : { "memory" : memObj } }).exports;
let intArray = new Int32Array (memObj.buffer);
let byteArray = new Uint8Array (memObj.buffer);

let testStore = function (funcname, ...expected) {
    
    const index = 0;
    
    for (let i = 0; i < expected.length; i++) {
        intArray[4 + i] = expected[i];
    }
    
    instance[funcname](index, ...expected);
        
    for (let i = 0; i < expected.length; i++)
        assertEquals(expected[i], intArray[index + i]);
}


testStore("v128_store4", 777, 888, 999, 1111);
testStore("v128_store4", -1, 0, 0, -1);
testStore("v128_store4", -1, -1, -1, -1);

for (let i = 0; i < 18; i++) {
    byteArray[i] = 0;
}

// Check that v128 store does not overrun value boundaries
instance.v128_store_i32x4(1, 0x01020304);

assertEquals(0, byteArray[0]);
assertEquals(4, byteArray[1]);
assertEquals(3, byteArray[2]);
assertEquals(2, byteArray[3]);
assertEquals(1, byteArray[4]);
assertEquals(4, byteArray[5]);
assertEquals(3, byteArray[6]);
assertEquals(2, byteArray[7]);
assertEquals(1, byteArray[8]);
assertEquals(4, byteArray[9]);
assertEquals(3, byteArray[10]);
assertEquals(2, byteArray[11]);
assertEquals(1, byteArray[12]);
assertEquals(4, byteArray[13]);
assertEquals(3, byteArray[14]);
assertEquals(2, byteArray[15]);
assertEquals(1, byteArray[16]);
assertEquals(0, byteArray[17]);

const MEM_SIZE_IN_BYTES = 1024 * 64;
check("RangeError", "instance.v128_store4", MEM_SIZE_IN_BYTES - 12, 777, 888, 999, 1111);
check("RangeError", "instance.v128_store4", MEM_SIZE_IN_BYTES - 8, 777, 888, 999, 1111);
check("RangeError", "instance.v128_store4", MEM_SIZE_IN_BYTES - 4, 777, 888, 999, 1111);
check("RangeError", "instance.v128_store4_offset", -1, 777, 888, 999, 1111);
check("RangeError", "instance.v128_store4_offset", 0xFFFFFFFC, 777, 888, 999, 1111);
check(undefined, "instance.v128_store4", MEM_SIZE_IN_BYTES - 16, 777, 888, 999, 1111);

if (passed) {
    print("Passed");
}
