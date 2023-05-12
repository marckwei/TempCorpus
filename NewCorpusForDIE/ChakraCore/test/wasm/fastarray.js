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
function checkTrap(fn) {
  try {
    fn();
    console.log("Should have trapped");
  } catch (e) {
    if (!(e instanceof WebAssembly.RuntimeError)) {
      console.log(e);
    }
  }
}

function runScenario() {
  const module = new WebAssembly.Module(readbuffer("binaries/fastarray.wasm"));
  const {exports: {load, store, mem}} = new WebAssembly.Instance(module);
  function test() {
    checkTrap(() => load(0));
    checkTrap(() => load(0xFF));
    checkTrap(() => load(0xFFFFFFFF));
    checkTrap(() => store(0));
    checkTrap(() => store(0xFF));
    checkTrap(() => store(0xFFFFFFFF));
  }

  test();
  mem.grow(5);
  test();
  mem.grow(2);
  test();
}

runScenario();

console.log("PASSED");
