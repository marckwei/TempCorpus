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

WebAssembly.instantiate(WebAssembly.wabt.convertWast2Wasm(`
(module
    (type $t1 (func (result i32)))
    (type $t2 (func (param i32) (result i32)))
    (type $t3 (func))
    (import "test" "foo" (func $foo (type $t2)))

    (memory (export "memory") 5000 5000)
    (global $x (mut i32) (i32.const -12))
    (func $f1 (type $t1) (local i32)
        (set_local 0 (i32.const 321))
        (return
            (i32.add
                (i32.const 2)
                (call $f3 (get_local 0))
            )
        )
    )
    (func $f2 (export "a") (type $t2) (local f32)
        (if (i32.ge_s (i32.const 26) (i32.const 25))
            (set_local 0 (i32.add (get_local 0) (i32.const 4)))
        )
        (set_local 0 (i32.add (get_local 0) (call_indirect (type $t1) (i32.const 0))))
        (if (i32.ge_s (i32.const 22) (i32.const 25))
            (set_local 0 (i32.add (get_local 0) (i32.const 4)))
            (set_local 0 (i32.sub (get_local 0) (i32.const 5)))
        )
        (block
            (set_local 0 (i32.add (get_local 0) (i32.const 4)))
            (set_local 0 (i32.add (get_local 0) (i32.clz (get_local 0))))
            (set_local 0 (i32.add (get_local 0) (call $f1)))
            (br_if 0 (select (f32.ne (get_local 1) (get_local 1)) (i32.const 0) (i32.const 1)))
            (set_local 0 (i32.add (get_local 0) (i32.const 4)))
        )
        (call $foo (get_local 0))
        (i32.store (get_local 0) (i32.add (get_local 0) (i32.const 7)))
        (set_local 0 (i32.load (get_local 0)))
        (set_local 1 (f32.convert_s/i32 (get_local 0)))
        (set_local 1 (f32.add (get_local 1) (get_local 1)))
        (set_local 0 (i32.reinterpret/f32 (get_local 1)))
        (set_local 0 (i32.add (get_local 0) (call $foo (get_local 0))))
        (return (i32.add (get_local 0) (i32.const 42)))
    )
    (func $f3 (type $t2)
        (set_global $x (get_local 0))
        (i32.store (get_global $x)
            (i32.add
                (get_local 0)
                (i32.const 456)
            )
        )
        (call $f4)
        (return (i32.load (get_local 0))
    ))
    (func $f4 (type $t3)
        (return)
    )
    (table anyfunc (elem $f1 $f2))
)`), {test: {foo(v) {return v + 5;}}})
  .then(({instance: {exports: {a}}}) => {
    console.log(a());
    console.log(a());
  }, console.log)
  .catch(console.log);



