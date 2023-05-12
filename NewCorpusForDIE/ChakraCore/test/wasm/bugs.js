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
WScript.Flag("-wasmcheckversion-");
function createView(bytes) {
  const buffer = new ArrayBuffer(bytes.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; ++i) {
    view[i] = bytes.charCodeAt(i);
  }
  return view;
}
async function main() {
  const {instance: {exports: {foo, bar}}} = await WebAssembly.instantiate(WebAssembly.wabt.convertWast2Wasm(`
(module
  (func (export "foo") (result i64) (i64.extend_u/i32 (i32.const 0x80000000)))
  (func (export "bar") (result i64) (i64.extend_u/i32 (i32.const 0xabcdef12)))
)`));
  foo();
  bar();

  try {
    new WebAssembly.Module(createView(`\x00asm\x01\x00\x00\x00\x3f\xff\xff\xff\x7f\x00\x00\x00`));
    console.log("Should have had an error");
  } catch (e) {
    if (!(e instanceof WebAssembly.CompileError && e.message.includes("Invalid known section opcode"))) {
      throw e;
    }
  }
  try {
    new WebAssembly.Module(createView(`\x00asm\x01\x00\x00\x00\x7f\x00\x00\x00`));
    console.log("Should have had an error");
  } catch (e) {
    if (!(e instanceof WebAssembly.CompileError && e.message.includes("Invalid known section opcode"))) {
      throw e;
    }
  }

  {
    const mod = new WebAssembly.Module(WebAssembly.wabt.convertWast2Wasm(`
(module
  (func (export "foo") (result i32) (i32.const 0))
)`));
    const instance1 = new WebAssembly.Instance(mod);
    const instance2 = new WebAssembly.Instance(mod);

    // Change the type of the function on the first instance
    instance1.exports.foo.asdf = 5;
    instance1.exports.foo();
    // Make sure the entrypoint has been correctly updated on the second instance
    instance2.exports.foo();
  }
}

main().then(() => console.log("PASSED"), err => {
  console.log(err.stack);
});
