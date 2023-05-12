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

{
    const count = 1000;
    const signature = [];
    for (let i = 0; i < count; ++i)
        signature.push("i32");

    let builder = new Builder()
        .Type()
        .End()
        .Import()
            .Function("imp", "f1", {params:signature, ret:"void"})
            .Function("imp", "f2", {params:signature, ret:"void"})
        .End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
            .Function("foo", {params: signature, ret: "void" });

    for (let i = 0; i < count; ++i)
        builder = builder.GetLocal(i);

    builder = builder.Call(0);

    for (let i = count; i--; )
        builder = builder.GetLocal(i);

    builder = builder.Call(1).Return().End().End();

    let calledF1 = false;
    let calledF2 = false;

    function f1(...args) {
        calledF1 = true;
        let realArgs = [...args, ...args];
        return end(...realArgs);
    }
    noInline(f1);

    function end() {}
    noInline(end);


    function f2(...args) {
        calledF2 = true;
        let called = false;
        assert.eq(args.length, count);
        for (let i = 0; i < args.length; ++i) {
            assert.eq(args[i], args.length - i - 1);
        }
    }
    noInline(f2);

    let instance = new WebAssembly.Instance(new WebAssembly.Module(builder.WebAssembly().get()), {imp: {f1, f2}});

    const args = [];
    for (let i = 0; i < count; ++i)
        args.push(i);

    for (let i = 0; i < 50; ++i) {
        instance.exports.foo(...args);

        assert.eq(calledF1, true);
        assert.eq(calledF2, true);
        calledF1 = false;
        calledF2 = false;
    }
}
