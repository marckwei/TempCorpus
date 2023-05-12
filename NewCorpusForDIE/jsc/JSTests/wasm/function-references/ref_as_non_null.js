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

//@ runWebAssemblySuite("--useWebAssemblyTypedFunctionReferences=true")
import * as assert from '../assert.js';
import { instantiate } from "../wabt-wrapper.js";

function module(bytes, valid = true) {
  let buffer = new ArrayBuffer(bytes.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; ++i) {
    view[i] = bytes.charCodeAt(i);
  }
  return new WebAssembly.Module(buffer);
}

async function ref_as_non_null() {
  /*
  (module
    (type $t (func))
    (elem declare funcref (ref.func $foo))
    (func $foo)
    (func $f (result (ref null $t)) (ref.func $foo))
    (func (export "main") (result (ref $t))
      (ref.as_non_null (call $f)))
  )
  */
  let instance = new WebAssembly.Instance(module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8e\x80\x80\x80\x00\x03\x60\x00\x00\x60\x00\x01\x6c\x00\x60\x00\x01\x6b\x00\x03\x84\x80\x80\x80\x00\x03\x00\x01\x02\x07\x88\x80\x80\x80\x00\x01\x04\x6d\x61\x69\x6e\x00\x02\x09\x87\x80\x80\x80\x00\x01\x07\x70\x01\xd2\x00\x0b\x0a\x9b\x80\x80\x80\x00\x03\x82\x80\x80\x80\x00\x00\x0b\x84\x80\x80\x80\x00\x00\xd2\x00\x0b\x85\x80\x80\x80\x00\x00\x10\x01\xd3\x0b"));
  instance.exports.main();

  /*
  (module
    (type $t (func))
    (elem declare funcref (ref.func $foo))
    (func $foo)
    (func $f (result (ref null $t)) (ref.null $t))
    (func (export "main") (result (ref $t))
      (ref.as_non_null (call $f)))
  )
  */
  assert.throws(
    () => new WebAssembly.Instance(module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8e\x80\x80\x80\x00\x03\x60\x00\x00\x60\x00\x01\x6c\x00\x60\x00\x01\x6b\x00\x03\x84\x80\x80\x80\x00\x03\x00\x01\x02\x07\x88\x80\x80\x80\x00\x01\x04\x6d\x61\x69\x6e\x00\x02\x09\x87\x80\x80\x80\x00\x01\x07\x70\x01\xd2\x00\x0b\x0a\x9b\x80\x80\x80\x00\x03\x82\x80\x80\x80\x00\x00\x0b\x84\x80\x80\x80\x00\x00\xd0\x00\x0b\x85\x80\x80\x80\x00\x00\x10\x01\xd3\x0b")).exports.main(),
    WebAssembly.RuntimeError,
    "ref.as_non_null to a null reference (evaluating 'func(...args)')"
  )
}

assert.asyncTest(ref_as_non_null());
