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

const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
      .Type().End()
      .Function().End()
      .Export()
          .Function("h")
          .Function("i")
          .Function("j")
          .Function("k")
      .End()
      .Code()
        .Function("h", { params: ["externref"], ret: "externref" })
          .GetLocal(0)
        .End()

        .Function("i", { params: [], ret: "externref" })
            .RefNull("externref")
            .Call(0)
        .End()

        .Function("j", { params: ["externref"], ret: "i32" })
            .GetLocal(0)
            .RefIsNull()
        .End()

        .Function("k", { params: [], ret: "i32" })
            .RefNull("externref")
            .RefIsNull()
        .End()
      .End().WebAssembly().get()));

const $2 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
      .Type().End()
      .Import()
          .Function("m1", "h", { params: ["externref"], ret: "externref" })
          .Function("m1", "j", { params: ["externref"], ret: "i32" })
          .Function("js", "ident", { params: ["externref"], ret: "externref" })
          .Function("js", "make_null", { params: [], ret: "externref" })
      .End()
      .Function().End()
      .Export()
          .Function("call_h")
          .Function("call_j")
          .Function("call_h_null")
          .Function("call_j_null")
          .Function("call_ident")
          .Function("call_ident_null")
          .Function("is_makenull_null")
      .End()
      .Code()
        .Function("call_h", { params: ["externref"], ret: "externref" })
          .GetLocal(0)
          .Call(0)
        .End()

        .Function("call_j", { params: ["externref"], ret: "i32" })
          .GetLocal(0)
          .Call(1)
        .End()

        .Function("call_h_null", { params: [], ret: "externref" })
          .RefNull("externref")
          .Call(0)
        .End()

        .Function("call_j_null", { params: [], ret: "i32" })
          .RefNull("externref")
          .Call(1)
        .End()

        .Function("call_ident", { params: ["externref"], ret: "externref" })
          .I32Const(1)
          .If("externref")
          .Block("externref", (b) =>
            b.GetLocal(0)
          )
          .Else()
          .Block("externref", (b) =>
            b.GetLocal(0)
          )
          .End()
          .Call(2)
        .End()

        .Function("call_ident_null", { params: [], ret: "externref" })
          .RefNull("externref")
          .Call(2)
        .End()

        .Function("is_makenull_null", { params: [], ret: "i32" })
          .Call(3)
          .RefIsNull()
        .End()
      .End().WebAssembly().get()), { m1: $1.exports, js: {
        ident: function(x) { return x; },
        make_null: function() { return null; },
      } });

assert.eq($2.exports.call_h(null), null)

const obj = { test: "hi" }
assert.eq($2.exports.call_h(obj), obj)
assert.eq($2.exports.call_h(5), 5)
assert.eq($2.exports.call_h("hi"), "hi")
assert.eq($2.exports.call_h(undefined), undefined)

assert.eq($2.exports.call_j(obj), 0)
assert.eq($2.exports.call_j(5), 0)
assert.eq($2.exports.call_j("hi"), 0)
assert.eq($2.exports.call_j(null), 1)
assert.eq($2.exports.call_j(undefined), 0)

assert.eq($2.exports.call_h_null(), null)
assert.eq($2.exports.call_j_null(), 1)

assert.eq($2.exports.call_ident(null), null)
assert.eq($2.exports.call_ident(obj), obj)
assert.eq($2.exports.call_ident(5), 5)
assert.eq($2.exports.call_ident("hi"), "hi")
assert.eq($2.exports.call_ident(undefined), undefined)

for (let i=0; i<1000; ++i) {
    // Trigger the ic path
    assert.eq($2.exports.call_ident(null), null)
    assert.eq($2.exports.call_ident(7), 7)
    assert.eq($2.exports.call_ident("bye"), "bye")
}

assert.eq($2.exports.call_ident_null(), null)
assert.eq($2.exports.is_makenull_null(), 1)
