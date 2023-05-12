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

const buf = WebAssembly.wabt.convertWast2Wasm(`(module
  (import "test" "foo" (func $foo (param i32)))
  (func $a (export "a") (param i32)
    (call $foo (get_local 0))
  )
  (func $c (export "c") (param i32)
    (call $d (get_local 0))
  )
  (func $d (param i32)
    (call $a (get_local 0))
  )
)`);
var testValue;
class MyException extends Error {}
var MyExceptionExport = MyException;
var lastModule;
var lastInstance;
var mem = new WebAssembly.Memory({initial: 1});
var table = new WebAssembly.Table({element: "anyfunc", initial: 15});

function createModule() {
  lastModule = new WebAssembly.Module(buf);
  lastInstance = new WebAssembly.Instance(lastModule, {test: {
    foo: function(val) {
      testValue = val;
      throw new MyException();
    }
  }});
  return lastInstance.exports;
}
