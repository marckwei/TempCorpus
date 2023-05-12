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

import * as assert from '../assert.js'

/*
This test loads a WebAssembly file compiled with wat2wasm with support for code annotations:
wat2wasm --enable-annotations --enable-code-metadata branchHintsModule

From the following .wat:
(module
  (func $fun (param i32) (result i32)
        (local i32)
        i32.const 10
        local.tee 1
        local.get 0
        i32.mul
        local.tee 0
        i32.const 10
        i32.gt_s
        (@metadata.code.branch_hint "\01") if
          local.get 0
          return
        end
        (block
          local.get 0
          i32.const 0
          i32.le_s
          (@metadata.code.branch_hint "\00") br_if 0
          local.get 0
          return
        )
        local.get 1
        return
  )
  (export "_fun" (func $fun)))
*/

const verbose = false;
const wasmFile = 'branchHintsModule.wasm';

const module = (location) => {
    if (verbose)
        print(`Processing ${location}`);
    let buf = typeof readbuffer !== "undefined"? readbuffer(location) : read(location, 'binary');
    if (verbose)
        print(`  Size: ${buf.byteLength}`);
    let module = new WebAssembly.Module(buf);
    return module;
};

const branchHintsModule = module(wasmFile);
const parsedBranchHintsSection = WebAssembly.Module.customSections(branchHintsModule, "metadata.code.branch_hint");
assert.eq(parsedBranchHintsSection.length, 1);
const instance = new WebAssembly.Instance(branchHintsModule);
const fun = instance.exports._fun;
assert.truthy(fun(-1));
assert.truthy(fun(0));
assert.truthy(fun(1));
assert.truthy(fun(2));
