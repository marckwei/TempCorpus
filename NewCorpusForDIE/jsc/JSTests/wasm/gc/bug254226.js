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

function testNestedStruct() {
   let m = instantiate(`(module
    (type $inner (struct (field i32) (field i32)))
    (type $outer (struct (field (ref $inner)) (field (ref $inner))))

    (func $new (export "new") (result (ref $outer))
       (struct.new_canon $outer (struct.new_canon $inner (i32.const 41) (i32.const 42))
                                (struct.new_canon $inner (i32.const 43) (i32.const 45))))

    (func (export "get_field0_0") (result i32)
       (call $new)
       (struct.get $inner 0 (struct.get $outer 0)))

    (func (export "get_field0_1") (result i32)
       (call $new)
       (struct.get $inner 1 (struct.get $outer 0)))

    (func (export "get_field1_0") (result i32)
       (call $new)
       (struct.get $inner 0 (struct.get $outer 1)))

    (func (export "get_field1_1") (result i32)
       (call $new)
       (struct.get $inner 1 (struct.get $outer 1))))`);

    assert.eq(m.exports.get_field0_0(), 41);
    assert.eq(m.exports.get_field0_1(), 42);
    assert.eq(m.exports.get_field1_0(), 43);
    assert.eq(m.exports.get_field1_1(), 45);
}

function testNestedStructWithLocal() {
   let m = instantiate(`(module
  (type $bvec (array i8))
  (type $inner (struct (field i32) (field (ref $bvec))))
  (type $outer (struct (field (ref $inner)) (field (ref $inner))))

  (func $new (export "new") (result (ref $outer))
    (local i32)
    (local.set 0 (i32.const 42))
    (struct.new_canon $outer (struct.new_canon $inner (i32.const 3) (array.new_canon_default $bvec (i32.const 1)))
                             (struct.new_canon $inner (local.get 0) (array.new_canon_default $bvec (i32.const 6)))))

  (func (export "get_field0_0") (result i32)
    (call $new)
    (struct.get $inner 0 (struct.get $outer 0)))

  (func (export "get_field0_len1") (result i32)
    (call $new)
    (array.len (struct.get $inner 1 (struct.get $outer 0))))


  (func (export "get_field1_0") (result i32)
    (call $new)
    (struct.get $inner 0 (struct.get $outer 1)))

  (func (export "get_field1_len1") (result i32)
    (call $new)
    (array.len (struct.get $inner 1 (struct.get $outer 1))))

)`);

    assert.eq(m.exports.get_field0_0(), 3);
    assert.eq(m.exports.get_field0_len1(), 1);

    assert.eq(m.exports.get_field1_0(), 42);
    assert.eq(m.exports.get_field1_len1(), 6);
}

testNestedStruct();
testNestedStructWithLocal();
