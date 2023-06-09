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

import Builder from '../Builder.js'
import * as assert from '../assert.js'

function makeInstance() {
    const tableDescription = {initial: 1, element: "funcref"};
    const builder = new Builder()
        .Type()
            .Func(["i32", "i32"], "i32")
            .Func(["i32"], "i32")
        .End()
        .Import()
            .Table("imp", "table", tableDescription)
        .End()
        .Function().End()
        .Export()
            .Function("foo")
            .Function("bar")
        .End()
        .Code()
            .Function("foo", 0 /*['i32', 'i32'] => 'i32'*/)
                .GetLocal(1) // parameter to call
                .GetLocal(0) // call index
                .CallIndirect(1, 0) // calling function of type ['i32'] => 'i32'
                .Return()
            .End()
            .Function("bar", 1 /*['i32'] => 'i32'*/)
                .GetLocal(0)
                .I32Const(42)
                .I32Add()
                .Return()
            .End()
        .End();


    const bin = builder.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const table = new WebAssembly.Table(tableDescription);
    return {instance: new WebAssembly.Instance(module, {imp: {table}}), table};
}

{
    const {instance, table} = makeInstance();
    const foo = instance.exports.foo;
    const bar = instance.exports.bar;
    assert.eq(table.get(0), null);

    for (let i = 0; i < 1000; i++) {
        assert.throws(() => foo(0, i), WebAssembly.RuntimeError, "call_indirect to a null table entry");
    }

    table.set(0, foo);
    assert.eq(table.get(0), foo);

    for (let i = 0; i < 1000; i++) {
        assert.throws(() => foo(1 + i, i), WebAssembly.RuntimeError, "Out of bounds call_indirect");
    }

    for (let i = 0; i < 1000; i++) {
        assert.throws(() => foo(0, i), WebAssembly.RuntimeError, "call_indirect to a signature that does not match");
    }

    table.set(0, bar);
    assert.eq(table.get(0), bar);
    for (let i = 0; i < 25; i++) {
        assert.eq(foo(0, i), i + 42);
    }
}
