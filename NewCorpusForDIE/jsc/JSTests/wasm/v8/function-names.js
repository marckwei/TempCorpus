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

//@ requireOptions("--useBBQJIT=1", "--useWasmLLInt=1", "--wasmLLIntTiersUpToBBQ=1")
//@ skip
// Failure:
// Exception: Failure (should start with 'at exec_unreachable (': '<?>.wasm-function[1]@[wasm code]'): expected <true> found <false>
//
//  Stack: MjsUnitAssertionError@mjsunit.js:36:27
//  failWithMessage@mjsunit.js:323:36
//  fail@mjsunit.js:343:27
//  assertEquals@mjsunit.js:413:11
//  assertTrue@mjsunit.js:465:17
//  testFunctionNamesAsString@function-names.js:45:17
//  global code@function-names.js:49:3
//  MjsUnitAssertionError@mjsunit.js:36:27
//  failWithMessage@mjsunit.js:323:36
//  fail@mjsunit.js:343:27
//  assertEquals@mjsunit.js:413:11
//  assertTrue@mjsunit.js:465:17
//  testFunctionNamesAsString@function-names.js:64:17
//  global code@function-names.js:68:3

// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("wasm-module-builder.js");

var builder = new WasmModuleBuilder();

var last_func_index = builder.addFunction("exec_unreachable", kSig_v_v)
  .addBody([kExprUnreachable]).index

var illegal_func_name = [0xff];
var func_names = [ "☠", illegal_func_name, "some math: (½)² = ¼", "" ];
var expected_names = ["exec_unreachable", "☠", null,
                      "some math: (½)² = ¼", "", "main"];

for (var func_name of func_names) {
  last_func_index = builder.addFunction(func_name, kSig_v_v)
    .addBody([kExprCallFunction, last_func_index]).index;
}

builder.addFunction("main", kSig_v_v)
  .addBody([kExprCallFunction, last_func_index])
  .exportFunc();

var module = builder.instantiate();

(function testFunctionNamesAsString() {
  var names = expected_names.concat(["testFunctionNamesAsString", null]);
  try {
    module.exports.main();
    assertFalse("should throw");
  } catch (e) {
    var lines = e.stack.split(/\r?\n/);
    lines.shift();
    assertEquals(names.length, lines.length);
    for (var i = 0; i < names.length; ++i) {
      var line = lines[i].trim();
      if (names[i] === null) continue;
      var printed_name = names[i];
      var expected_start = "at " + printed_name + " (";
      assertTrue(line.startsWith(expected_start),
          "should start with '" + expected_start + "': '" + line + "'");
    }
  }
})();

// For the remaining tests, collect the Callsite objects instead of just a
// string:
Error.prepareStackTrace = function(error, frames) {
  return frames;
};

(function testFunctionNamesAsCallSites() {
  var names = expected_names.concat(['testFunctionNamesAsCallSites', null]);
  try {
    module.exports.main();
    assertFalse('should throw');
  } catch (e) {
    assertEquals(names.length, e.stack.length, 'stack length');
    for (var i = 0; i < names.length; ++i) {
      assertEquals(
          names[i], e.stack[i].getFunctionName(), 'function name at ' + i);
    }
  }
})();
