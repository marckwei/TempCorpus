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

let passed = true;
let check = function(expected, funName, ...args)
{
    let fun = eval(funName);
    var result;
    try {
       result = fun(...args);
    }
    catch (e) {
        result = e.message;
    }

    if(result != expected)
    {
        passed = false;
        print(`${funName}(${[...args]}) produced ${result}, expected ${expected}`);
    }
}


let ffi = {};
var mod = new WebAssembly.Module(readbuffer('trunc.wasm'));
var exports = new WebAssembly.Instance(mod, ffi).exports;

//i32
check("Overflow","exports.i32_trunc_u_f64",Number.NaN);
check("Overflow","exports.i32_trunc_s_f64",Number.NaN);
check("Overflow","exports.i32_trunc_u_f32",Number.NaN);
check("Overflow","exports.i32_trunc_s_f32",Number.NaN);

check(-1,"exports.i32_trunc_u_f64",4294967295.0);
check("Overflow","exports.i32_trunc_u_f64",4294967296.0);
check(0,"exports.i32_trunc_u_f64",0.0);
//check(0,"exports.i32_trunc_u_f64",0.7); BUG!!! Needs to be fixed!
check("Overflow","exports.i32_trunc_u_f64",-1);

check(2147483647,"exports.i32_trunc_s_f64",2147483647.0);
check("Overflow","exports.i32_trunc_s_f64",2147483648.0); 

check(-2147483648,"exports.i32_trunc_s_f64",-2147483648.0);
check("Overflow","exports.i32_trunc_s_f64",-2147483649.0);

check(-256,"exports.i32_trunc_u_f32",4294967040.0);
check("Overflow","exports.i32_trunc_u_f32",4294967296.0);

check(2147483520,"exports.i32_trunc_s_f32",2147483520.0);
check("Overflow","exports.i32_trunc_s_f32",2147483647.0);

check(-2147483520,"exports.i32_trunc_s_f32",-2147483520.0);
check("Overflow","exports.i32_trunc_s_f32",-2147483800.0);

//i64
check("Overflow","exports.i64_trunc_u_f64",Number.NaN);
check("Overflow","exports.i64_trunc_s_f64",Number.NaN);
check("Overflow","exports.i64_trunc_u_f32",Number.NaN);
check("Overflow","exports.i64_trunc_s_f32",Number.NaN);

check(1,"exports.test1");
check("Overflow","exports.test2");
check(1,"exports.test3");
check(1,"exports.test4");
check("Overflow","exports.test5");

check(1,"exports.test6");
check("Overflow","exports.test7");
check(1,"exports.test8");
check("Overflow","exports.test9");

check(1,"exports.test10");
check("Overflow","exports.test11");
check(1,"exports.test12");
check(1,"exports.test13");
check("Overflow","exports.test14");

check(1,"exports.test15");
check("Overflow","exports.test16");
check(1,"exports.test17");
check("Overflow","exports.test18");

if(passed)
{
    print("Passed");
}
