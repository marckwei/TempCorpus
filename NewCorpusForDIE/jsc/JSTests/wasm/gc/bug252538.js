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

function module(bytes, valid = true) {
  let buffer = new ArrayBuffer(bytes.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; ++i) {
    view[i] = bytes.charCodeAt(i);
  }
  return new WebAssembly.Module(buffer);
}

function testStructOfInts() {

  let m = instantiate(`
    (module
      (type $s (struct (field i32) (field i32) (field i32)))

      (func $new (result (ref $s))
         (struct.new_canon $s (i32.const 5) (i32.const 17) (i32.const 0)))

      (func (export "get0") (result i32)
         (struct.get $s 0 (call $new)))
      (func (export "get1") (result i32)
         (struct.get $s 1 (call $new)))
      (func (export "get2") (result i32)
         (struct.get $s 2 (call $new))))`);

    assert.eq(m.exports.get0(), 5);
    assert.eq(m.exports.get1(), 17);
    assert.eq(m.exports.get2(), 0);
}

function testStructDeclaration() {

  let m = instantiate(`
    (module
      (type $a (array i32))
      (type $s (struct (field (ref $a)) (field (ref $a)) (field (ref $a))))

      (func $new (result (ref $s))
         (struct.new_canon $s (array.new_canon_default $a (i32.const 5))
                              (array.new_canon_default $a (i32.const 17))
                              (array.new_canon_default $a (i32.const 0))))

      (func (export "len0") (result i32)
         (struct.get $s 0 (call $new))
         (array.len))
      (func (export "len1") (result i32)
         (struct.get $s 1 (call $new))
         (array.len))
      (func (export "len2") (result i32)
         (struct.get $s 2 (call $new))
         (array.len)))`);

    assert.eq(m.exports.len0(), 5);
    assert.eq(m.exports.len1(), 17);
    assert.eq(m.exports.len2(), 0);
}

// for comparison
testStructOfInts();
testStructDeclaration();
