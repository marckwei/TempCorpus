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

function module(bytes, valid = true) {
  let buffer = new ArrayBuffer(bytes.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; ++i) {
    view[i] = bytes.charCodeAt(i);
  }
  return new WebAssembly.Module(buffer);
}

async function exportRefIndexResultFunc() {
  /*
   * (module
   *   (type (func))
   *   (type (func (result (ref 0))))
   *   (global (ref 0) (ref.func 0))
   *   (func)
   *   (func (export "f") (type 1) (global.get 0))
   * )
   */
  let instance = new WebAssembly.Instance(module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x00\x01\x6b\x00\x03\x83\x80\x80\x80\x00\x02\x00\x01\x06\x87\x80\x80\x80\x00\x01\x6b\x00\x00\xd2\x00\x0b\x07\x85\x80\x80\x80\x00\x01\x01\x66\x00\x01\x0a\x91\x80\x80\x80\x00\x02\x82\x80\x80\x80\x00\x00\x0b\x84\x80\x80\x80\x00\x00\x23\x00\x0b"));
  instance.exports.f();

  /*
   * (module
   *   (type (func))
   *   (type (func (result (ref 0))))
   *   (func (import "m" "f") (type 1))
   * )
   */
  new WebAssembly.Instance(module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x00\x01\x6b\x00\x02\x87\x80\x80\x80\x00\x01\x01\x6d\x01\x66\x00\x01"),
                           { m: { f: instance.exports.f } });
}

async function refIndexArgToJS() {
  /*
   * (module
   *   (type (func))
   *   (type (func (param (ref null 0))))
   *   (func (import "m" "f") (type 1))
   *   (func (export "g") (type 0) (call 0 (ref.null 0)))
   * )
   */
  {
    let instance = new WebAssembly.Instance(module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x6c\x00\x00\x02\x87\x80\x80\x80\x00\x01\x01\x6d\x01\x66\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x85\x80\x80\x80\x00\x01\x01\x67\x00\x01\x0a\x8c\x80\x80\x80\x00\x01\x86\x80\x80\x80\x00\x00\xd0\x00\x10\x00\x0b"),
                                            { m: { f: (g) => { assert.eq(g, null) } } });
    instance.exports.g();
  }

  /*
   * (module
   *   (type (func (param funcref))) ;; encoded as (ref null func)
   *   (func (import "m" "f") (type 0))
   *   (func (export "g") (call 0 (ref.null 0)))
   * )
   */
  {
    let instance = new WebAssembly.Instance(module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x02\x60\x01\x70\x00\x60\x00\x00\x02\x87\x80\x80\x80\x00\x01\x01\x6d\x01\x66\x00\x00\x03\x82\x80\x80\x80\x00\x01\x01\x07\x85\x80\x80\x80\x00\x01\x01\x67\x00\x01\x0a\x8c\x80\x80\x80\x00\x01\x86\x80\x80\x80\x00\x00\xd0\x00\x10\x00\x0b"),
                                            { m: { f: (g) => { assert.eq(g, null) } } });
    instance.exports.g();
  }
}

assert.asyncTest(exportRefIndexResultFunc());
assert.asyncTest(refIndexArgToJS());
