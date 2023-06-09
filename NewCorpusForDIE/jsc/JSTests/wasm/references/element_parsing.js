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

import * as assert from '../assert.js';

function module(bytes, valid = true) {
  let buffer = new ArrayBuffer(bytes.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; ++i) {
    view[i] = bytes.charCodeAt(i);
  }
  let validated;
  try {
    validated = WebAssembly.validate(buffer);
  } catch (e) {
    console.log(e)
    throw new Error("Wasm validate throws");
  }
  return new WebAssembly.Module(buffer);
}

assert.throws(() => module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x97\x80\x80\x80\x00\x05\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x00\x00\x60\x01\x6f\x00\x60\x01\x7f\x01\x7f\x03\x88\x80\x80\x80\x00\x07\x00\x01\x02\x03\x02\x04\x04\x04\x87\x80\x80\x80\x00\x02\x6f\x00\x02\x70\x00\x02\x07\xc1\x80\x80\x80\x00\x06\x06\x61\x6e\x79\x72\x65\x66\x00\x00\x07\x66\x75\x6e\x63\x72\x65\x66\x00\x01\x04\x69\x6e\x69\x74\x00\x03\x06\x64\x65\x69\x6e\x69\x74\x00\x04\x0b\x61\x6e\x79\x72\x65\x66\x2d\x65\x6c\x65\x6d\x00\x05\x0c\x66\x75\x6e\x63\x72\x65\x66\x2d\x65\x6c\x65\x6d\x00\x06\x09\x88\x80\x80\x80\x00\x01"
// Table elem section:
// 0x02 x:tableidx e:expr y*:vec(funcidx)
//  + "\x02"
    + "\x01"
    + "\x41\x01\x0b\x01\x02\x0a\xd4\x80\x80\x80\x00\x07\x85\x80\x80\x80\x00\x00\x20\x00\xd1\x0b\x85\x80\x80\x80\x00\x00\x20\x00\xd1\x0b\x82\x80\x80\x80\x00\x00\x0b\x88\x80\x80\x80\x00\x00\x41\x01\x20\x00\x26\x00\x0b\x8c\x80\x80\x80\x00\x00\x41\x01\xd0\x26\x00\x41\x01\xd0\x26\x01\x0b\x88\x80\x80\x80\x00\x00\x20\x00\x25\x00\x10\x00\x0b\x88\x80\x80\x80\x00\x00\x20\x00\x25\x01\x10\x01\x0b"),
    Error, "WebAssembly.Module doesn't parse at byte 144: element kind must be zero (evaluating 'new WebAssembly.Module(buffer)')");
