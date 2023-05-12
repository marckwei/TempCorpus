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
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Export()
            .Function("loop")
        .End()
        .Code()
        .Function("loop", { params: ["i32"], ret: "i32" }, ["i32"])
        .I32Const(0)
        .SetLocal(1)
        .Loop("void")
        .Block("void", b =>
               b.GetLocal(0)
               .I32Const(0)
               .I32Eq()
               .BrIf(0)
               .GetLocal(0)
               .GetLocal(1)
               .I32Add()
               .SetLocal(1)
               .GetLocal(0)
               .I32Const(1)
               .I32Sub()
               .SetLocal(0)
               .Br(1)
              )
        .End()
        .GetLocal(1)
        .Return()
        .End()
        .End()

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);

    assert.eq(987459712, instance.exports.loop(100000000));
}
{
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Export()
            .Function("loop")
        .End()
        .Code()
        .Function("loop", { params: ["i32", "f32"], ret: "f32" }, ["f32"])
        .F32Const(0)
        .SetLocal(2)
        .Loop("void")
        .Block("void", b =>
               b.GetLocal(0)
               .I32Const(0)
               .I32Eq()
               .BrIf(0)
               .GetLocal(1)
               .GetLocal(2)
               .F32Add()
               .SetLocal(2)
               .GetLocal(0)
               .I32Const(1)
               .I32Sub()
               .SetLocal(0)
               .Br(1)
              )
        .End()
        .GetLocal(2)
        .Return()
        .End()
        .End()

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);

    assert.eq(1087937, instance.exports.loop(10000000, 0.1));
}
{
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Export()
            .Function("loop")
        .End()
        .Code()
        .Function("loop", { params: ["i32", "f64"], ret: "f64" }, ["f64"])
        .F64Const(0)
        .SetLocal(2)
        .Loop("void")
        .Block("void", b =>
               b.GetLocal(0)
               .I32Const(0)
               .I32Eq()
               .BrIf(0)
               .GetLocal(1)
               .GetLocal(2)
               .F64Add()
               .SetLocal(2)
               .GetLocal(0)
               .I32Const(1)
               .I32Sub()
               .SetLocal(0)
               .Br(1)
              )
        .End()
        .GetLocal(2)
        .Return()
        .End()
        .End()

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);

    assert.eq(999999.9998389754, instance.exports.loop(10000000, 0.1));
}
{
    const b = new Builder();
    b.Type().End()
        .Function().End()
        .Export()
            .Function("loop")
        .End()
        .Code()
        .Function("loop", { params: ["i32"], ret: "i32" }, ["i64"])
        .I64Const(0)
        .SetLocal(1)
        .Loop("void")
        .Block("void", b =>
               b.GetLocal(0)
               .I32Const(0)
               .I32Eq()
               .BrIf(0)
               .I64Const(3)
               .GetLocal(1)
               .I64Add()
               .SetLocal(1)
               .GetLocal(0)
               .I32Const(1)
               .I32Sub()
               .SetLocal(0)
               .Br(1)
              )
        .End()
        .GetLocal(1)
        .I32WrapI64()
        .Return()
        .End()
        .End()

    const bin = b.WebAssembly().get();
    const module = new WebAssembly.Module(bin);
    const instance = new WebAssembly.Instance(module);

    assert.eq(30000000, instance.exports.loop(10000000));
}
