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

function makeSharedArrayBuffer(length) {
  const pages = ((length / (64 * 1024))|0) + 1;
  const mem = new WebAssembly.Memory({initial: pages, maximum: pages, shared: true});
  if (!(mem.buffer instanceof SharedArrayBuffer)) {
    throw new Error("WebAssembly.Memory::buffer is not a SharedArrayBuffer");
  }
  return mem.buffer;
}

function modifyTests(tests) {
  return tests.map(test => {
    if (test.name !== "Atomics.wait index test") {
      return test;
    }
    test.body = () => {
      const length = ((64 * 1024)|0) / 4;
      var view = new Int32Array(makeSharedArrayBuffer(1));
      assert.doesNotThrow(() => Atomics.wait(view, 0, 0, 0), "Atomics.wait is allowed on the index 0, where the view's length is 2");
      assert.doesNotThrow(() => Atomics.wait(view, "0", 0, 0), "ToNumber : Atomics.wait is allowed on the index 0, where the view's length is 2");
      assert.throws(() => Atomics.wait(view, length, 0, 0), RangeError, "Index is greater than the view's length", "Access index is out of range");
      assert.throws(() => Atomics.wait(view, -1, 0, 0), RangeError, "Negative index is not allowed", "Access index is out of range");
    };
    return test;
  });
}

// Test to make sure we are able to create the WebAssemblySharedArrayBuffer
makeSharedArrayBuffer(0);

WScript.LoadScriptFile("../es7/atomics_test.js");
