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

//@ skip if $architecture != "arm"

import {throws} from "../assert.js"

function module(bytes, valid = true) {
    let buffer = new ArrayBuffer(bytes.length);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; ++i) {
        view[i] = bytes.charCodeAt(i);
    }
    return new WebAssembly.Module(buffer);
}

/*
 * (module
 *   (memory 65536)
 *   (func (export entry)
 *     (param)
 *     (result i64)
 *     (i32.const 65535)
 *     (i32.const 255)
 *     (i32.store8)
 *     (i64.const 0)
 *     (return)))
 */

const wasmModule = module("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x05\x01\x60\x00\x01\x7e\x03\x02\x01\x00\x05\x05\x01\x00\x80\x80\x04\x07\x09\x01\x05\x65\x6e\x74\x72\x79\x00\x00\x0a\x11\x01\x0f\x00\x41\xff\xff\x03\x41\xff\x01\x3a\x00\x00\x42\x00\x0f\x0b");

throws (
    () => {
        const instance = new WebAssembly.Instance(wasmModule);
        instance.exports.entry();
    },
    RangeError,
    "Out of memory"
);
