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

//@ runWebAssemblySuite("--useWebAssemblyTypedFunctionReferences=true", "--useWebAssemblyGC=true", "--collectContinuously=true")

import { compile, instantiate } from "./wast-wrapper.js";

// Test that with compound type definitions like recursion and subtypes that
// type definitions don't get de-allocated too soon.
//
// Even with continuous collection enabled, the test is somewhat non-deterministic
// so we loop several times to ensure it triggers.
for (let i = 0; i < 10; i++) {
  instantiate(`(module (type (func)))`);
  let m1 = instantiate(`
    (module
      (type (struct))
      (type (sub 0 (struct (field i32))))
      (global (export "g") (ref null 1) (ref.null 1))
    )
  `);
  instantiate(`
    (module
      (type (struct))
      (type (sub 0 (struct (field i32))))
      (global (import "m" "g") (ref null 1))
    )
  `, { m: { g: m1.exports.g } });
}

for (let i = 0; i < 10; i++) {
  instantiate(`(module (type (func)))`);
  let m1 = instantiate(`
    (module
      (rec (type (struct)) (type (func)))
      (global (export "g") (ref null 1) (ref.null 1))
    )
  `);
  instantiate(`
    (module
      (rec (type (struct)) (type (func)))
      (global (import "m" "g") (ref null 1))
    )
  `, { m: { g: m1.exports.g } });
}
