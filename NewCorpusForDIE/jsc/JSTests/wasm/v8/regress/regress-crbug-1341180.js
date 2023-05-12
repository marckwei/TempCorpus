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

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

let bytes = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d,  // wasm magic
  0x01, 0x00, 0x00, 0x00,  // wasm version

  0x01, 0x04,              // Type section, 4 bytes
  0x01,                    // types count 1
  0x60, 0x00, 0x00,        // kind: func, no params, no returns

  0x03, 0x02,              // Function section, 2 bytes
  0x01,                    // functions count 1
  0x00,                    // func0: type0 (result i32)

  0x0a, 0x02,              // Code section, 2 bytes
  0x01,                    // functions count 1
                           // function #0
  0x00,                    // body size 0 (which is invalid, which causes
                           // lazy decoding of the name section in order to
                           // produce an error message)

  0x00, 0x10,              // Unknown section, 16 bytes
  0x04,                    // section name length: 4
  0x6e, 0x61, 0x6d, 0x65,  // section name: name
  0x01,                    // name type: function
  0x09,                    // payload length: 9
  0x02,                    // names count 2
  0xff, 0xff, 0xff, 0xff, 0x0f, 0x00,  // index 4294967295 name length: 0
  0x00, 0x00,              // index 0 name length: 0
]);

assertThrows(
    () => new WebAssembly.Instance(new WebAssembly.Module(bytes)),
    WebAssembly.CompileError);

// Variant found in crbug.com/1342338: duplicate "function names" subsection.
// The spec doesn't allow this, but we shouldn't crash when it happens.
let duplicate_funcname_subsection = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d,  // wasm magic
  0x01, 0x00, 0x00, 0x00,  // wasm version

  0x01, 0x04,              // Type section, 4 bytes
  0x01,                    // types count 1
  0x60, 0x00, 0x00,        // kind: func, no params, no returns

  0x03, 0x02,              // Function section, 2 bytes
  0x01,                    // functions count 1
  0x00,                    // func0: type0 (result i32)

  0x0a, 0x02,              // Code section, 2 bytes
  0x01,                    // functions count 1
                           // function #0
  0x00,                    // body size 0 (which is invalid, which causes
                           // lazy decoding of the name section in order to
                           // produce an error message)

  0x00, 0x0f,              // Unknown section, 15 bytes
  0x04,                    // section name length: 4
  0x6e, 0x61, 0x6d, 0x65,  // section name: name
  0x01,                    // name type: function
  0x03,                    // payload length: 3
  0x01,                    // names count 1
  0x00, 0x00,              // index 0 name length: 0
  0x01,                    // name type: function
  0x03,                    // payload length: 3
  0x01,                    // names count 1
  0x01, 0x00,              // index 1 name length: 0
]);

assertThrows(
    () => new WebAssembly.Instance(
        new WebAssembly.Module(duplicate_funcname_subsection)),
    WebAssembly.CompileError);
