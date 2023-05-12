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
// Exception: Failure: expected <true> found <false>
//
//  Stack: MjsUnitAssertionError@mjsunit.js:36:27
//  failWithMessage@mjsunit.js:323:36
//  fail@mjsunit.js:343:27
//  assertEquals@mjsunit.js:413:11
//  assertTrue@mjsunit.js:465:17
//  assertValid@stringrefs-valid.js:28:13
//  global code@stringrefs-valid.js:36:12

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-gc --experimental-wasm-stringref

load("wasm-module-builder.js");

function assertValid(fn) {
  let builder = new WasmModuleBuilder();
  fn(builder);
  // If an assertValid() ever fails unexpectedly, uncomment this line to
  // get a more precise error:
  // builder.toModule();
  assertTrue(WebAssembly.validate(builder.toBuffer()));
}
function assertInvalid(fn, message) {
  let builder = new WasmModuleBuilder();
  fn(builder);
  assertThrows(() => builder.toModule(), WebAssembly.CompileError, message);
}

assertValid(builder => builder.addLiteralStringRef("foo"));

for (let [name, code] of [['string', kStringRefCode],
                          ['stringview_wtf8', kStringViewWtf8Code],
                          ['stringview_wtf16', kStringViewWtf16Code],
                          ['stringview_iter', kStringViewIterCode]]) {
  let default_init = [kExprRefNull, code];

  assertValid(b => b.addType(makeSig([code], [])));
  assertValid(b => b.addStruct([makeField(code, true)]));
  assertValid(b => b.addArray(code, true));
  assertValid(b => b.addType(makeSig([], [code])));
  assertValid(b => b.addGlobal(code, true, default_init));
  assertValid(b => b.addTable(code, 0));
  assertValid(b => b.addPassiveElementSegment([default_init], code));
  assertValid(b => b.addTag(makeSig([code], [])));
  assertValid(
    b => b.addFunction(undefined, kSig_v_v).addLocals(code, 1).addBody([]));
}

let kSig_w_ii = makeSig([kWasmI32, kWasmI32], [kWasmStringRef]);
let kSig_w_v = makeSig([], [kWasmStringRef]);
let kSig_i_w = makeSig([kWasmStringRef], [kWasmI32]);
let kSig_i_wi = makeSig([kWasmStringRef, kWasmI32], [kWasmI32]);
let kSig_w_ww = makeSig([kWasmStringRef, kWasmStringRef], [kWasmStringRef]);
let kSig_i_ww = makeSig([kWasmStringRef, kWasmStringRef], [kWasmI32]);
let kSig_x_w = makeSig([kWasmStringRef], [kWasmStringViewWtf8]);
let kSig_i_xii = makeSig([kWasmStringViewWtf8, kWasmI32, kWasmI32],
                         [kWasmI32]);
let kSig_ii_xiii = makeSig([kWasmStringViewWtf8, kWasmI32, kWasmI32,
                            kWasmI32],
                           [kWasmI32, kWasmI32]);
let kSig_w_xii = makeSig([kWasmStringViewWtf8, kWasmI32, kWasmI32],
                         [kWasmStringRef]);
let kSig_y_w = makeSig([kWasmStringRef], [kWasmStringViewWtf16]);
let kSig_i_y = makeSig([kWasmStringViewWtf16], [kWasmI32]);
let kSig_i_yi = makeSig([kWasmStringViewWtf16, kWasmI32], [kWasmI32]);
let kSig_i_yiii = makeSig([kWasmStringViewWtf16, kWasmI32, kWasmI32,
                           kWasmI32], [kWasmI32]);
let kSig_w_yii = makeSig([kWasmStringViewWtf16, kWasmI32, kWasmI32],
                         [kWasmStringRef]);
let kSig_z_w = makeSig([kWasmStringRef], [kWasmStringViewIter]);
let kSig_i_z = makeSig([kWasmStringViewIter], [kWasmI32]);
let kSig_i_zi = makeSig([kWasmStringViewIter, kWasmI32], [kWasmI32]);
let kSig_w_zi = makeSig([kWasmStringViewIter, kWasmI32],
                        [kWasmStringRef]);

(function TestInstructions() {
  let builder = new WasmModuleBuilder();

  builder.addMemory(0, undefined, false, false);

  builder.addFunction("string.new_utf8", kSig_w_ii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringNewUtf8), 0
    ]);
  builder.addFunction("string.new_lossy_utf8", kSig_w_ii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringNewLossyUtf8), 0
    ]);
  builder.addFunction("string.new_wtf8", kSig_w_ii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringNewWtf8), 0
    ]);

  builder.addFunction("string.new_wtf16", kSig_w_ii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringNewWtf16), 0
    ]);

  builder.addLiteralStringRef("foo");
  builder.addFunction("string.const", kSig_w_v)
    .addBody([
      ...GCInstr(kExprStringConst), 0
    ]);

  builder.addFunction("string.measure_utf8", kSig_i_w)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringMeasureUtf8)
    ]);
  builder.addFunction("string.measure_wtf8", kSig_i_w)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringMeasureWtf8)
    ]);

  builder.addFunction("string.measure_wtf16", kSig_i_w)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringMeasureWtf16)
    ]);

  builder.addFunction("string.encode_utf8", kSig_i_wi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringEncodeUtf8), 0
    ]);
  builder.addFunction("string.encode_lossy_utf8", kSig_i_wi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringEncodeLossyUtf8), 0
    ]);
  builder.addFunction("string.encode_wtf8", kSig_i_wi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringEncodeWtf8), 0
    ]);

  builder.addFunction("string.encode_wtf16", kSig_i_wi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringEncodeWtf16), 0
    ]);

  builder.addFunction("string.concat", kSig_w_ww)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringConcat)
    ]);

  builder.addFunction("string.eq", kSig_i_ww)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringEq)
    ]);

  builder.addFunction("string.as_wtf8", kSig_x_w)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringAsWtf8)
    ]);

  builder.addFunction("stringview_wtf8.advance", kSig_i_xii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2,
      ...GCInstr(kExprStringViewWtf8Advance)
    ]);

  builder.addFunction("stringview_wtf8.encode_utf8", kSig_ii_xiii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2, kExprLocalGet, 3,
      ...GCInstr(kExprStringViewWtf8EncodeUtf8), 0
    ]);
  builder.addFunction("stringview_wtf8.encode_lossy_utf8", kSig_ii_xiii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2, kExprLocalGet, 3,
      ...GCInstr(kExprStringViewWtf8EncodeLossyUtf8), 0
    ]);
  builder.addFunction("stringview_wtf8.encode_wtf8", kSig_ii_xiii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2, kExprLocalGet, 3,
      ...GCInstr(kExprStringViewWtf8EncodeWtf8), 0
    ]);

  builder.addFunction("stringview_wtf8.slice", kSig_w_xii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2,
      ...GCInstr(kExprStringViewWtf8Slice)
    ]);

  builder.addFunction("string.as_wtf16", kSig_y_w)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringAsWtf16)
    ]);

  builder.addFunction("stringview_wtf16.length", kSig_i_y)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringViewWtf16Length)
    ]);

  builder.addFunction("stringview_wtf16.get_codeunit", kSig_i_yi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringViewWtf16GetCodeunit)
    ]);

  builder.addFunction("stringview_wtf16.encode", kSig_i_yiii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2, kExprLocalGet, 3,
      ...GCInstr(kExprStringViewWtf16Encode), 0
    ]);

  builder.addFunction("stringview_wtf16.slice", kSig_w_yii)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1, kExprLocalGet, 2,
      ...GCInstr(kExprStringViewWtf16Slice)
    ]);

  builder.addFunction("string.as_iter", kSig_z_w)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringAsIter)
    ]);

  builder.addFunction("stringview_iter.next", kSig_i_z)
    .addBody([
      kExprLocalGet, 0,
      ...GCInstr(kExprStringViewIterNext)
    ]);

  builder.addFunction("stringview_iter.advance", kSig_i_zi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringViewIterAdvance)
    ]);

  builder.addFunction("stringview_iter.rewind", kSig_i_zi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringViewIterRewind)
    ]);

  builder.addFunction("stringview_iter.slice", kSig_w_zi)
    .addBody([
      kExprLocalGet, 0, kExprLocalGet, 1,
      ...GCInstr(kExprStringViewIterSlice)
    ]);

  let i8_array = builder.addArray(kWasmI8, true);
  let i16_array = builder.addArray(kWasmI16, true);

  builder.addFunction("string.new_utf8_array", kSig_w_v)
    .addBody([
      kExprRefNull, i8_array,
      kExprI32Const, 0,
      kExprI32Const, 0,
      ...GCInstr(kExprStringNewWtf8Array)
    ]);
  builder.addFunction("string.new_lossy_utf8_array", kSig_w_v)
    .addBody([
      kExprRefNull, i8_array,
      kExprI32Const, 0,
      kExprI32Const, 0,
      ...GCInstr(kExprStringNewLossyUtf8Array)
    ]);
  builder.addFunction("string.new_wtf8_array", kSig_w_v)
    .addBody([
      kExprRefNull, i8_array,
      kExprI32Const, 0,
      kExprI32Const, 0,
      ...GCInstr(kExprStringNewWtf8Array)
    ]);

  builder.addFunction("string.new_wtf16_array", kSig_w_v)
    .addBody([
      kExprRefNull, i16_array,
      kExprI32Const, 0,
      kExprI32Const, 0,
      ...GCInstr(kExprStringNewWtf16Array)
    ]);

  builder.addFunction("string.encode_utf8_array", kSig_i_v)
    .addBody([
      kExprRefNull, kStringRefCode,
      kExprRefNull, i8_array,
      kExprI32Const, 0,
      ...GCInstr(kExprStringEncodeUtf8Array)
    ]);
  builder.addFunction("string.encode_lossy_utf8_array", kSig_i_v)
    .addBody([
      kExprRefNull, kStringRefCode,
      kExprRefNull, i8_array,
      kExprI32Const, 0,
      ...GCInstr(kExprStringEncodeLossyUtf8Array)
    ]);
  builder.addFunction("string.encode_wtf8_array", kSig_i_v)
    .addBody([
      kExprRefNull, kStringRefCode,
      kExprRefNull, i8_array,
      kExprI32Const, 0,
      ...GCInstr(kExprStringEncodeWtf8Array)
    ]);

  builder.addFunction("string.encode_wtf16_array", kSig_i_v)
    .addBody([
      kExprRefNull, kStringRefCode,
      kExprRefNull, i16_array,
      kExprI32Const, 0,
      ...GCInstr(kExprStringEncodeWtf16Array)
    ]);

  assertTrue(WebAssembly.validate(builder.toBuffer()));
})();

assertInvalid(
  builder => {
    builder.addFunction("string.const/bad-index", kSig_w_v)
      .addBody([
        ...GCInstr(kExprStringConst), 0
      ]);
  },
  /Invalid string literal index: 0/);

assertInvalid(
  builder => {
    builder.addFunction("string.new_wtf8/no-mem", kSig_w_ii)
      .addBody([
        kExprLocalGet, 0, kExprLocalGet, 1,
        ...GCInstr(kExprStringNewWtf8), 0
      ]);
  },
  /memory instruction with no memory/);

assertInvalid(
  builder => {
    builder.addMemory(0, undefined, false, false);
    builder.addFunction("string.new_wtf8/bad-mem", kSig_w_ii)
      .addBody([
        kExprLocalGet, 0, kExprLocalGet, 1,
        ...GCInstr(kExprStringNewWtf8), 1
      ]);
  },
  /expected memory index 0, found 1/);

assertInvalid(
  builder => {
    builder.addFunction("string.encode_wtf8/no-mem", kSig_i_wi)
      .addBody([
        kExprLocalGet, 0, kExprLocalGet, 1,
        ...GCInstr(kExprStringEncodeWtf8), 0
      ]);
  },
  /memory instruction with no memory/);

assertInvalid(
  builder => {
    builder.addMemory(0, undefined, false, false);
    builder.addFunction("string.encode_wtf8/bad-mem", kSig_i_wi)
      .addBody([
        kExprLocalGet, 0, kExprLocalGet, 1,
        ...GCInstr(kExprStringEncodeWtf8), 1
      ]);
  },
  /expected memory index 0, found 1/);

assertInvalid(
  builder => {
    let i16_array = builder.addArray(kWasmI16, true);
    builder.addFunction("string.new_wtf8_array/bad-type", kSig_w_v)
      .addBody([
        kExprRefNull, i16_array,
        kExprI32Const, 0,
        kExprI32Const, 0,
        ...GCInstr(kExprStringNewWtf8Array)
      ]);
  },
  /string.new_wtf8_array\[0\] expected array of i8, found ref.null of type \(ref null 0\)/);

assertInvalid(
  builder => {
    let i8_array = builder.addArray(kWasmI8, true);
    builder.addFunction("string.new_wtf16_array/bad-type", kSig_w_v)
      .addBody([
        kExprRefNull, i8_array,
        kExprI32Const, 0,
        kExprI32Const, 0,
        ...GCInstr(kExprStringNewWtf16Array)
      ]);
  },
  /string.new_wtf16_array\[0\] expected array of i16, found ref.null of type \(ref null 0\)/);

assertInvalid(
  builder => {
    let immutable_i8_array = builder.addArray(kWasmI8, false);
    let sig = makeSig([kWasmStringRef,
                       wasmRefType(immutable_i8_array),
                       kWasmI32],
                      [kWasmI32]);
    builder.addFunction("string.encode_wtf8_array/bad-type", sig)
      .addBody([
        kExprLocalGet, 0,
        kExprLocalGet, 1,
        kExprLocalGet, 2,
        ...GCInstr(kExprStringEncodeWtf8Array)
      ]);
  },
  /string.encode_wtf8_array\[1\] expected array of mutable i8, found local.get of type \(ref 0\)/);

assertInvalid(
  builder => {
    let immutable_i16_array = builder.addArray(kWasmI16, false);
    let sig = makeSig([kWasmStringRef,
                       wasmRefType(immutable_i16_array),
                       kWasmI32],
                      [kWasmI32]);
    builder.addFunction("string.encode_wtf16_array/bad-type", sig)
      .addBody([
        kExprLocalGet, 0,
        kExprLocalGet, 1,
        kExprLocalGet, 2,
        ...GCInstr(kExprStringEncodeWtf16Array),
      ]);
  },
  /string.encode_wtf16_array\[1\] expected array of mutable i16, found local.get of type \(ref 0\)/);

assertInvalid(builder => {
  builder.addFunction(undefined, kSig_v_v).addBody([...GCInstr(0x790)]);
}, /invalid stringref opcode: fb790/);