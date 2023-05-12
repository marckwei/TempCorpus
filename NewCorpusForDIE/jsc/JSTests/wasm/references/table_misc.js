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
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 0, maximum: 0, element: "externref"})
                .Table({initial: 20, maximum: 30, element: "externref"})
          .End()
          .Export()
              .Function("tbl_size")
              .Table("tbl", 1)
          .End()
          .Code()
            .Function("tbl_size", { params: [], ret: "i32" })
              .TableSize(1)
            .End()
          .End().WebAssembly().get()));
    fullGC()

    assert.eq($1.exports.tbl_size(), 20)
    assert.eq($1.exports.tbl.grow(5), 20)
    assert.eq($1.exports.tbl_size(), 25)
    assert.eq($1.exports.tbl.get(0), null)
    assert.eq($1.exports.tbl.get(24), undefined)
}

assert.throws(() => new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Export()
          .Function("tbl_size")
      .End()
      .Code()
        .Function("tbl_size", { params: [], ret: "i32" })
          .TableSize(0)
        .End()
      .End().WebAssembly().get()), Error, "WebAssembly.Module doesn't validate: table index 0 is invalid, limit is 0, in function at index 0 (evaluating 'new WebAssembly.Module')")

{
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 0, maximum: 0, element: "externref"})
                .Table({initial: 20, maximum: 30, element: "externref"})
          .End()
          .Export()
              .Function("tbl_size")
              .Function("tbl_grow")
              .Function("ident")
              .Table("tbl", 1)
          .End()
          .Code()
            .Function("tbl_size", { params: [], ret: "i32" })
              .TableSize(1)
            .End()
            .Function("tbl_grow", { params: ["externref", "i32"], ret: "i32" })
                .GetLocal(0)
                .GetLocal(1)
                .TableGrow(1)
            .End()
            .Function("ident", { params: ["i32"], ret: "i32" })
                .GetLocal(0)
            .End()
          .End().WebAssembly().get()));
    fullGC()

    assert.eq($1.exports.ident("hi"), 0)

    assert.eq($1.exports.tbl_size(), 20)
    assert.eq($1.exports.tbl_grow("hi", 5), 20)
    assert.eq($1.exports.tbl_size(), 25)
    assert.eq($1.exports.tbl.get(0), null)
    assert.eq($1.exports.tbl.get(24), "hi")

    assert.eq($1.exports.tbl_grow(null, 5), 25)
    assert.eq($1.exports.tbl.get(24), "hi")
    assert.eq($1.exports.tbl.get(25), null)
    assert.eq($1.exports.tbl_size(), 30)
    assert.eq($1.exports.tbl_grow(null, 0), 30)
    assert.eq($1.exports.tbl_grow(null, 5), -1)
    assert.eq($1.exports.tbl_grow(null, 0), 30)
}

assert.throws(() => new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Code()
        .Function("tbl_grow", { params: ["externref", "i32"], ret: "i32" })
            .GetLocal(0)
            .GetLocal(1)
            .TableGrow(0)
        .End()
      .End().WebAssembly().get()), Error, "WebAssembly.Module doesn't validate: table index 0 is invalid, limit is 0, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Table()
            .Table({initial: 20, maximum: 30, element: "externref"})
      .End()
      .Code()
        .Function("tbl_grow", { params: ["externref", "i32"], ret: "i32" })
            .GetLocal(0)
            .TableGrow(0)
        .End()
      .End().WebAssembly().get()), Error, "WebAssembly.Module doesn't parse at byte 6: can't pop empty stack in table.grow, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Table()
            .Table({initial: 20, maximum: 30, element: "externref"})
      .End()
      .Code()
        .Function("tbl_grow", { params: ["i32", "i32"], ret: "i32" })
            .GetLocal(0)
            .GetLocal(1)
            .TableGrow(0)
        .End()
      .End().WebAssembly().get()), Error, "WebAssembly.Module doesn't validate: table.grow expects fill value of type Externref got I32, in function at index 0 (evaluating 'new WebAssembly.Module')")

{
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 20, maximum: 30, element: "externref"})
          .End()
          .Export()
              .Function("tbl_size")
              .Function("tbl_fill")
              .Table("tbl", 0)
          .End()
          .Code()
            .Function("tbl_size", { params: [], ret: "i32" })
              .TableSize(0)
            .End()
            .Function("tbl_fill", { params: ["i32", "externref", "i32"], ret: "void" })
                .GetLocal(0)
                .GetLocal(1)
                .GetLocal(2)
                .TableFill(0)
            .End()
          .End().WebAssembly().get()));
    fullGC()

    assert.eq($1.exports.tbl_size(), 20)
    $1.exports.tbl_fill(1,"hi",3)
    assert.eq($1.exports.tbl.get(0), null)
    assert.eq($1.exports.tbl.get(1), "hi")
    assert.eq($1.exports.tbl.get(2), "hi")
    assert.eq($1.exports.tbl.get(3), "hi")
    assert.eq($1.exports.tbl.get(4), null)

    $1.exports.tbl_fill(0,null,1)
    assert.eq($1.exports.tbl.get(0), null)
    $1.exports.tbl_fill(0,null,0)

    $1.exports.tbl_fill(19,"test",1)
    assert.eq($1.exports.tbl.get(19), "test")
    assert.eq($1.exports.tbl.get(18), null)

    assert.throws(() => $1.exports.tbl_fill(20,null,1), Error, "Out of bounds table access (evaluating 'func(...args)')")
    assert.throws(() => $1.exports.tbl_fill(19,null,2), Error, "Out of bounds table access (evaluating 'func(...args)')")
    assert.throws(() => $1.exports.tbl_fill(4294967295,null,1), Error, "Out of bounds table access (evaluating 'func(...args)')")
}

assert.throws(() => new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Code()
        .Function("tbl_grow", { params: ["externref", "i32"], ret: "void" })
            .GetLocal(1)
            .GetLocal(0)
            .GetLocal(1)
            .TableFill(0)
        .End()
      .End().WebAssembly().get()), Error, "WebAssembly.Module doesn't validate: table index 0 is invalid, limit is 0, in function at index 0 (evaluating 'new WebAssembly.Module')")

assert.throws(() => new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Table()
            .Table({initial: 20, maximum: 30, element: "externref"})
      .End()
      .Code()
        .Function("tbl_grow", { params: ["externref", "i32"], ret: "i32" })
            .GetLocal(0)
            .TableFill(0)
        .End()
      .End().WebAssembly().get()), Error, "WebAssembly.Module doesn't parse at byte 6: can't pop empty stack in table.fill, in function at index 0 (evaluating 'new WebAssembly.Module')")

{
    const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
          .Type().End()
          .Function().End()
          .Table()
                .Table({initial: 0, maximum: 0, element: "funcref"})
                .Table({initial: 20, maximum: 30, element: "funcref"})
          .End()
          .Export()
              .Function("tbl_size")
              .Function("tbl_grow")
              .Table("tbl", 1)
          .End()
          .Code()
            .Function("tbl_size", { params: [], ret: "i32" })
              .TableSize(1)
            .End()
            .Function("tbl_grow", { params: ["i32"], ret: "i32" })
                .I32Const(0)
                .TableGet(1)
                .GetLocal(0)
                .TableGrow(1)
            .End()
          .End().WebAssembly().get()));
    fullGC()

    $1.exports.tbl.set(0, $1.exports.tbl_size);
    assert.eq($1.exports.tbl_size(), 20)
    assert.eq($1.exports.tbl_grow(5), 20)
    assert.eq($1.exports.tbl_size(), 25)
    assert.eq($1.exports.tbl.get(0), $1.exports.tbl_size)
    assert.eq($1.exports.tbl.get(1), null)
    assert.eq($1.exports.tbl.get(24), $1.exports.tbl_size)
}