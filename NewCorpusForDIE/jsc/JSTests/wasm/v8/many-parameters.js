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

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

let types = [kWasmI32, kWasmF32, kWasmF64];
let type_names = ["i32", "f32", "f64"];
let type_const = [wasmI32Const, wasmF32Const, wasmF64Const];

function f(values, shift, num_const_params, ...args) {
  assertEquals(
      values.length + num_const_params, args.length, 'number of arguments');
  const expected = idx =>
      idx < values.length ? values[(idx + shift) % values.length] : idx;
  const msg = 'shifted by ' + shift + ': ' +
      'expected [' + args.map((_, i) => expected(i)).join(', ') + '], got [' +
      args.join(', ') + ']';
  args.forEach((arg_val, idx) => {
    assertEquals(expected(idx), arg_val, 'arg #' + idx + ', ' + msg);
  });
}

types.forEach((type, type_idx) => {
  for (let num_params = 3; num_params < 32; num_params += 4) {
/*
    print(
        'Testing ' + num_params + ' parameters of type ' +
        type_names[type_idx] + '...');
 */
    for (let num_const_params = 0; num_const_params <= 3; ++num_const_params) {
      for (let shift = 2; shift <= 5; shift += 3) {
        let builder = new WasmModuleBuilder();

        let params_outer = new Array(num_params).fill(type);
        sig_outer = makeSig(params_outer, []);
        let params_inner = new Array(num_params + num_const_params).fill(type);
        sig_inner = makeSig(params_inner, []);

        let body = [];
        for (let i = 0; i < num_params; ++i)
          body.push(kExprLocalGet, (i + shift) % num_params);
        for (let i = 0; i < num_const_params; ++i)
          body.push(...type_const[type_idx](num_params + i));
        body.push(kExprCallFunction, 0);

        builder.addImport('', 'f', sig_inner);
        builder.addFunction(undefined, sig_outer)
            .addBody(body)
            .exportAs('main');
        let values = new Array(num_params).fill(0).map((_, i) => 123 - 3 * i);

        instance = builder.instantiate(
            {'': {'f': f.bind(null, values, shift, num_const_params)}});
        instance.exports.main(...values);
      }
    }
  }
});
