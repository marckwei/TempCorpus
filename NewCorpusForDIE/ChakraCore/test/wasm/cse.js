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
WScript.Flag("-wasmI64");

function makeModule(type) {
  const funcName = `foo_${type}`;
  const mod = new WebAssembly.Module(WebAssembly.wabt.convertWast2Wasm(`
  (module
    (func (export "${funcName}") (param ${type}) (result ${type})
      (${type}.sub
        (${type}.add (get_local 0) (${type}.const 3))
        (${type}.add (get_local 0) (${type}.const 3))
      )
    )
  )`));
  const {exports} = new WebAssembly.Instance(mod);
  return exports[funcName];
}
const modules = {i32: makeModule("i32"), i64: makeModule("i64")};
function test(type, value) {
  const foo = modules[type];
  let res = foo(value);
  if (type === "i64") {
    res = res.low + res.high;
  }
  if (res !== 0) {
    print(`Error: ${type} (${value} + 3) - (${value} + 3) == ${res} !== 0`);
  }
}
test("i32", 0);
test("i32", 1);
test("i64", 0);
test("i64", 1);
test("i64", 2 * 4294967296);

print("PASSED");
