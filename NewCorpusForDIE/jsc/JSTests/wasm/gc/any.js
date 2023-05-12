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
          (ref.eq (ref.null any) (ref.null array))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: ref.eq ref1 to type RefNull expected Eqref, in function at index 0 (evaluating 'new WebAssembly.Module(binary)')"
  );

  assert.throws(
    () => compile(`
      (module
        (func (param anyref) (result))
        (func (call 0 (ref.null extern))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: argument type mismatch in call, got Externref, expected Anyref, in function at index 1 (evaluating 'new WebAssembly.Module(binary)')"
  );

  assert.throws(
    () => compile(`
      (module
        (type (struct))
        (func (param (ref null 0)) (result))
        (func (call 0 (ref.null any))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: argument type mismatch in call, got Anyref, expected (), in function at index 1 (evaluating 'new WebAssembly.Module(binary)')"
  );

  assert.throws(
    () => compile(`
      (module
        (func (param (ref null none)) (result))
        (func (call 0 (ref.null any))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: argument type mismatch in call, got Anyref, expected Nullref, in function at index 1 (evaluating 'new WebAssembly.Module(binary)')"
  );

  assert.throws(
    () => compile(`
      (module
        (type (struct))
        (func (param (ref none)) (result))
        (func (call 0 (struct.new_canon 0))))
    `),
    WebAssembly.CompileError,
    "WebAssembly.Module doesn't validate: argument type mismatch in call, got (), expected Nullref, in function at index 1 (evaluating 'new WebAssembly.Module(binary)')"
  );
}

function testAnyref() {
  instantiate(`
    (module
      (func (param anyref) (result))
      (func (export "f") (call 0 (ref.null array))))
  `).exports.f();

  instantiate(`
    (module
      (type (struct))
      (func (param anyref) (result))
      (func (export "f") (call 0 (struct.new_canon 0))))
  `).exports.f();
}

function testNullref() {
  instantiate(`
    (module
      (func (param nullref) (result))
      (func (export "f") (call 0 (ref.null none))))
  `).exports.f();

  instantiate(`
    (module
      (func (result nullref) (local nullref)
        (local.set 0 (ref.null none))
        (local.get 0))
      (func (export "f") (call 0) (drop)))
  `).exports.f();
}

testValidation();
testAnyref();
testNullref();
