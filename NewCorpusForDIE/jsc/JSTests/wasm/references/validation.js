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
import Builder from '../Builder.js';

{
    const builder = (new Builder())
      .Type().End()
      .Function().End()
      .Export()
          .Function("j")
      .End()
      .Code()
        .Function("j", { params: [], ret: "i32" })
            .I32Const(0)
            .RefIsNull()
        .End()
      .End();

    const bin = builder.WebAssembly();
    bin.trim();

    assert.throws(() => new WebAssembly.Module(bin.get()), WebAssembly.CompileError, "WebAssembly.Module doesn't validate: ref.is_null to type I32 expected a reference type, in function at index 0 (evaluating 'new WebAssembly.Module(bin.get())')");
}

{
    const builder = (new Builder())
      .Type().End()
      .Import()
            .Table("imp", "tbl", {initial: 2, element: "funcref"})
      .End()
      .Function().End()
      .Export()
          .Function("j")
      .End()
      .Code()
        .Function("j", { params: [], ret: "void" })
            .I32Const(0)
            .I32Const(0)
            .TableSet(0)
        .End()
      .End();

    const bin = builder.WebAssembly();
    bin.trim();

    assert.throws(() => new WebAssembly.Module(bin.get()), WebAssembly.CompileError, "WebAssembly.Module doesn't validate: table.set value to type I32 expected Funcref, in function at index 0 (evaluating 'new WebAssembly.Module(bin.get())')");
}

{
    const builder = (new Builder())
      .Type().End()
      .Import()
            .Table("imp", "tbl", {initial: 2, element: "funcref"})
      .End()
      .Function().End()
      .Export()
          .Function("j")
      .End()
      .Code()
        .Function("j", { params: ["externref"], ret: "void" })
            .I32Const(0)
            .GetLocal(0)
            .TableSet(0)
        .End()
      .End();

    const bin = builder.WebAssembly();
    bin.trim();

    assert.throws(() => new WebAssembly.Module(bin.get()), WebAssembly.CompileError, "WebAssembly.Module doesn't validate: table.set value to type Externref expected Funcref, in function at index 0 (evaluating 'new WebAssembly.Module(bin.get())')");
}

{
    const builder = (new Builder())
      .Type().End()
      .Import()
            .Table("imp", "tbl", {initial: 2, element: "externref"})
      .End()
      .Function().End()
      .Export()
          .Function("j")
      .End()
      .Code()
        .Function("j", { params: [], ret: "funcref" })
            .I32Const(0)
            .TableGet(0)
        .End()
      .End();

    const bin = builder.WebAssembly();
    bin.trim();

    assert.throws(() => new WebAssembly.Module(bin.get()), WebAssembly.CompileError, "WebAssembly.Module doesn't validate: control flow returns with unexpected type. Externref is not a Funcref, in function at index 0 (evaluating 'new WebAssembly.Module(bin.get())')");
}

{
    assert.throws(() => new WebAssembly.Table({initial:2, element:"i32"}), TypeError, "WebAssembly.Table expects its 'element' field to be the string 'funcref' or 'externref'");
}
