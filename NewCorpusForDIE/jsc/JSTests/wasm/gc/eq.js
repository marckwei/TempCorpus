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

//@ runWebAssemblySuite("--useWebAssemblyTypedFunctionReferences=true", "--useWebAssemblyGC=true")

import * as assert from "../assert.js";
import { compile, instantiate } from "./wast-wrapper.js";

function testValidation() {
  assert.throws(
    () => compile(`
      (module
        (func (result i32)
          (ref.eq (ref.null extern) (ref.null array))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: ref.eq ref1 to type RefNull expected Eqref, in function at index 0 (evaluating 'new WebAssembly.Module(binary)')"
  );

  assert.throws(
    () => compile(`
      (module
        (func (result i32)
          (ref.eq (i32.const 42) (ref.null array))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: ref.eq ref1 to type I32 expected Eqref, in function at index 0 (evaluating 'new WebAssembly.Module(binary)')"
  );
}

function testRefEq() {
  assert.eq(
    instantiate(`
       (module
         (func (export "f") (result i32)
           (ref.eq (ref.null array) (ref.null struct))))
    `).exports.f(),
    1
  );

  assert.eq(
    instantiate(`
       (module
         (type (struct))
         (func (export "f") (result i32)
           (ref.eq (struct.new_canon 0) (ref.null struct))))
    `).exports.f(),
    0
  );

  assert.eq(
    instantiate(`
       (module
         (type (struct))
         (func (export "f") (result i32) (local (ref null 0))
           (local.set 0 (struct.new_canon 0))
           (ref.eq (local.get 0) (local.get 0))))
    `).exports.f(),
    1
  );

  assert.eq(
    instantiate(`
       (module
         (func (export "f") (result i32)
           (ref.eq (i31.new (i32.const 42)) (i31.new (i32.const 42)))))
    `).exports.f(),
    1
  );

  assert.eq(
    instantiate(`
       (module
         (type (struct))
         (func (export "f") (result i32)
           (ref.eq (struct.new_canon 0) (struct.new_canon 0))))
    `).exports.f(),
    0
  );
}

testValidation();
testRefEq();
