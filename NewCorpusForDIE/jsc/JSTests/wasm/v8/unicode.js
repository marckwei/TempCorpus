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
// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

load("wasm-module-builder.js");

function checkImport(
    imported_module_name, imported_function_name) {
  var builder = new WasmModuleBuilder();
  builder.addImport(imported_module_name, imported_function_name, kSig_i_i);
  builder.addFunction('call_imp', kSig_i_i)
      .addBody([kExprLocalGet, 0, kExprCallFunction, 0])
      .exportFunc();

  let imp = i => i + 3;
  let instance = builder.instantiate(
      {[imported_module_name]: {[imported_function_name]: imp}});
  assertEquals(imp(0), instance.exports.call_imp(0));
  assertEquals(imp(4), instance.exports.call_imp(4));
}

checkImport('mod', 'foo');  // Base check.
checkImport('mod', '☺☺happy☺☺');
checkImport('☺☺happy☺☺', 'foo');
checkImport('☺☺happy☺☺', '☼+☃=☹');

function checkExports(
    internal_name_mul, exported_name_mul, internal_name_add,
    exported_name_add) {
  var builder = new WasmModuleBuilder();
  builder.addFunction(internal_name_mul, kSig_i_ii)
      .addBody([kExprLocalGet, 0, kExprLocalGet, 1, kExprI32Mul])
      .exportAs(exported_name_mul);
  builder.addFunction(internal_name_add, kSig_i_ii)
      .addBody([kExprLocalGet, 0, kExprLocalGet, 1, kExprI32Add])
      .exportAs(exported_name_add);

  let instance = builder.instantiate();
  assertEquals(14, instance.exports[exported_name_add](3, 11));
  assertEquals(-7, instance.exports[exported_name_add](5, -12));
  assertEquals(28, instance.exports[exported_name_mul](4, 7));
  assertEquals(-6, instance.exports[exported_name_mul](-3, 2));
}

checkExports('mul', 'mul', 'add', 'add');  // Base check.
checkExports('☺☺mul☺☺', 'mul', '☺☺add☺☺', 'add');
checkExports('☺☺mul☺☺', '☺☺mul☺☺', '☺☺add☺☺', '☺☺add☺☺');

(function errorMessageUnicodeInFuncName() {
  var builder = new WasmModuleBuilder();
  builder.addFunction('three snowmen: ☃☃☃', kSig_i_v).addBody([]).exportFunc();
  assertThrows(
      () => builder.instantiate(), WebAssembly.CompileError,
      /doesn't validate/);
})();

(function errorMessageUnicodeInImportModuleName() {
  var builder = new WasmModuleBuilder();
  builder.addImport('three snowmen: ☃☃☃', 'foo', kSig_i_v);
  assertThrows(
      () => builder.instantiate({}), TypeError,
      /import three snowmen: ☃☃☃:foo must be an object/);
})();

(function errorMessageUnicodeInImportElemName() {
  var builder = new WasmModuleBuilder();
  builder.addImport('mod', 'three snowmen: ☃☃☃', kSig_i_v);
  assertThrows(
      () => builder.instantiate({mod: {}}), WebAssembly.LinkError,
      /import function mod:three snowmen: ☃☃☃ must be callable/);
})();

(function errorMessageUnicodeInImportModAndElemName() {
  var builder = new WasmModuleBuilder();
  let mod_name = '☮▁▂▃▄☾ ♛ ◡ ♛ ☽▄▃▂▁☮';
  let func_name = '☾˙❀‿❀˙☽';
  builder.addImport(mod_name, func_name, kSig_i_v);
  assertThrows(
      () => builder.instantiate({[mod_name]: {}}), WebAssembly.LinkError,
      /import function ☮▁▂▃▄☾ ♛ ◡ ♛ ☽▄▃▂▁☮:☾˙❀‿❀˙☽ must be callable/);
})();