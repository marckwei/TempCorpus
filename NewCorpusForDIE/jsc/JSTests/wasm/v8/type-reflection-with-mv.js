function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
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

//@ requireOptions("--useBBQJIT=1", "--useWasmLLInt=1", "--wasmLLIntTiersUpToBBQ=1")
//@ skip
// Failure:
// Exception: TypeError: undefined is not a constructor (evaluating 'new WebAssembly.Function({parameters:p, results:r}, testFun)')
//  @type-reflection-with-mv.js:40:39
//  forEach@[native code]
//  TestFunctionConstructedCoercions@type-reflection-with-mv.js:45:20
//  global code@type-reflection-with-mv.js:53:3

// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-type-reflection --expose-gc

(function TestFunctionConstructedCoercions() {
  let obj1 = { valueOf: _ => 123.45 };
  let obj2 = { toString: _ => "456" };
  let gcer = { valueOf: _ => gc() };
  let testcases = [
    { params: { sig: [],
                val: [],
                exp: [], },
      result: { sig: ["i32", "f32"],
                val: [42.7, "xyz"],
                exp: [42, NaN] },
    },
    { params: { sig: [],
                val: [],
                exp: [], },
      result: { sig: ["i32", "f32", "f64"],
                val: (function* () { yield obj1;  yield obj2; yield "789" })(),
                exp: [123,   456,   789], },
    },
    { params: { sig: [],
                val: [],
                exp: [], },
      result: { sig: ["i32", "f32", "f64"],
                val: new Proxy([gcer, {}, "xyz"], {
                  get: function(obj, prop) { return Reflect.get(obj, prop); }
                }),
                exp: [0,     NaN,   NaN], },
    },
  ];
  testcases.forEach(function({params, result}) {
    let p = params.sig; let r = result.sig; var params_after;
    function testFun() { params_after = arguments; return result.val; }
    let fun = new WebAssembly.Function({parameters:p, results:r}, testFun);
    let result_after = fun.apply(undefined, params.val);
    assertArrayEquals(params.exp, params_after);
    assertEquals(result.exp, result_after);
  });
})();

(function TestFunctionConstructedCoercionsThrow() {
  let proxy_throw = new Proxy([1, 2], {
    get: function(obj, prop) {
      if (prop == 1) {
        throw new Error("abc");
      }
      return Reflect.get(obj, prop); },
  });
  function* generator_throw() {
    yield 1;
    throw new Error("def");
  }
  let testcases = [
    { val: 0,
      error: Error,
      msg: /not iterable/ },
    { val: [1],
      error: TypeError,
      msg: /multi-return length mismatch/ },
    { val: [1, 2, 3],
      error: TypeError,
      msg: /multi-return length mismatch/ },
    { val: proxy_throw,
      error: Error,
      msg: /abc/ },
    { val: generator_throw(),
      error: Error,
      msg: /def/ },
  ];
  testcases.forEach(function({val, error, msg}) {
    fun = new WebAssembly.Function({parameters:[], results:["i32", "i32"]},
        () => val);
    assertThrows(fun, error, msg);
  })
})();