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
function check(expected, funName, ...args)
{
  let fun = eval(funName);
  let result;
  try {
     result = fun(...args);
  } catch (e) {
    result = e.message;
  }

  if(result != expected) {
    passed = false;
    print(`${funName}(${[...args]}) produced ${result}, expected ${expected}`);
  }
}

let ffi = {}; 
let mod, exports;

function RunInt324Tests() {

    mod = new WebAssembly.Module(readbuffer('i32x4.wasm'));
    exports = new WebAssembly.Instance(mod, ffi).exports;

    check(2147483647, "exports.func_i32x4_0");
    check(0, "exports.func_i32x4_1");
    check(-2147483648, "exports.func_i32x4_2");
    check(-100, "exports.func_i32x4_3");
    
}
function RunInt16x8UnsignedTests() {
    
    mod = new WebAssembly.Module(readbuffer('i16x8_u.wasm'));
    exports = new WebAssembly.Instance(mod, ffi).exports;

    check(1, "exports.func_i16x8_u_0");
    check(2, "exports.func_i16x8_u_1");
    check(32768, "exports.func_i16x8_u_2");
    check(0, "exports.func_i16x8_u_3");
    check(32767, "exports.func_i16x8_u_4");
    check(6, "exports.func_i16x8_u_5");
    check(65535, "exports.func_i16x8_u_6");
    check(65526, "exports.func_i16x8_u_7");
}

function RunInt16x8SignedTests() {
    
    mod = new WebAssembly.Module(readbuffer('i16x8_s.wasm'));
    exports = new WebAssembly.Instance(mod, ffi).exports;

    check(1, "exports.func_i16x8_s_0");
    check(2, "exports.func_i16x8_s_1");
    check(-32768, "exports.func_i16x8_s_2");
    check(0, "exports.func_i16x8_s_3");
    check(32767, "exports.func_i16x8_s_4");
    check(6, "exports.func_i16x8_s_5");
    check(7, "exports.func_i16x8_s_6");
    check(-10, "exports.func_i16x8_s_7");
}

function RunInt8x16UnsignedTests() {
    
    mod = new WebAssembly.Module(readbuffer('i8x16_u.wasm'));
    exports = new WebAssembly.Instance(mod, ffi).exports;

    check(1, "exports.func_i8x16_u_0");
    check(2, "exports.func_i8x16_u_1");
    check(128, "exports.func_i8x16_u_2");
    check(4, "exports.func_i8x16_u_3");
    check(127, "exports.func_i8x16_u_4");
    check(6, "exports.func_i8x16_u_5");
    check(7, "exports.func_i8x16_u_6");
    check(8, "exports.func_i8x16_u_7");    
    check(9, "exports.func_i8x16_u_8");
    check(255, "exports.func_i8x16_u_9");
    check(11, "exports.func_i8x16_u_10");
    check(12, "exports.func_i8x16_u_11");
    check(13, "exports.func_i8x16_u_12");
    check(14, "exports.func_i8x16_u_13");
    check(15, "exports.func_i8x16_u_14");
    check(236, "exports.func_i8x16_u_15");
}

function RunInt8x16SignedTests() {
    
    mod = new WebAssembly.Module(readbuffer('i8x16_s.wasm'));
    exports = new WebAssembly.Instance(mod, ffi).exports;

    check(1, "exports.func_i8x16_s_0");
    check(2, "exports.func_i8x16_s_1");
    check(-128, "exports.func_i8x16_s_2");
    check(4, "exports.func_i8x16_s_3");
    check(127, "exports.func_i8x16_s_4");
    check(6, "exports.func_i8x16_s_5");
    check(7, "exports.func_i8x16_s_6");
    check(8, "exports.func_i8x16_s_7");    
    check(9, "exports.func_i8x16_s_8");
    check(10, "exports.func_i8x16_s_9");
    check(11, "exports.func_i8x16_s_10");
    check(12, "exports.func_i8x16_s_11");
    check(13, "exports.func_i8x16_s_12");
    check(14, "exports.func_i8x16_s_13");
    check(15, "exports.func_i8x16_s_14");
    check(-20, "exports.func_i8x16_s_15");
}

function RunFloat32x4Tests() {
    
    mod = new WebAssembly.Module(readbuffer('f32x4.wasm'));
    exports = new WebAssembly.Instance(mod, ffi).exports;

    check(1.0, "exports.func_f32x4_0");
    check(3.4028234663852886e+38, "exports.func_f32x4_1");
    check(2147483648, "exports.func_f32x4_2");
    check(-2147483648, "exports.func_f32x4_3");
}

//Tests
RunInt324Tests();
RunInt16x8UnsignedTests();
RunInt16x8SignedTests();
RunInt8x16UnsignedTests();
RunInt8x16SignedTests();
RunFloat32x4Tests();
    
if(passed) {
  print("Passed");
}
