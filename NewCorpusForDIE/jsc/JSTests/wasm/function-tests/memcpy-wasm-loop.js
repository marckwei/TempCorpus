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

let memory = new WebAssembly.Memory({initial:1, maximum:1});

let i32 = new Int32Array(memory.buffer);
for (let i = 0; i < 100; i++) {
    i32[i] = i;
}

const $1 = new WebAssembly.Instance(new WebAssembly.Module((new Builder())
      .Type().End()
      .Import()
        .Memory("js", "mem", {initial:1, maximum:1})
      .End()
      .Function().End()
      .Global().End()
      .Export()
          .Function("do_memcpy")
      .End()
      .Code()
        .Function("do_memcpy", { params: ["i32","i32","i32"], ret: "void" }, ["i32"])
            .I32Const(0)
            .SetLocal(3)
            .Loop("void")
            .Block("void", b =>
               b.GetLocal(2)
               .GetLocal(3)
               .I32Eq()
               .BrIf(0)

               .GetLocal(1)
               .I32Const(4)
               .I32Mul()
               .GetLocal(3)
               .I32Const(4)
               .I32Mul()
               .I32Add()

               .GetLocal(0)
               // Intentional bug: no multiply here
               .GetLocal(3)
               .I32Const(4)
               .I32Mul()
               .I32Add()
               .I32Load(0,0)

               .I32Store(0,0)

               .GetLocal(3)
               .I32Const(1)
               .I32Add()
               .SetLocal(3)
               .Br(1)
              )
            .End()
        .End()
      .End().WebAssembly().get()), { js: { mem: memory } });

for (let i=0; i<500; ++i)
    $1.exports.do_memcpy(0,50,30);

for (let i = 0; i < 50; i++) {
    assert.eq(i32[i], i);
}
for (let i = 50; i < 50+30; i++) {
    assert.eq(i32[i], i-50);
}
for (let i = 50+30; i < 100; i++) {
    assert.eq(i32[i], i);
}

$1.exports.do_memcpy(0,5,10);
for (let i = 0; i < 5; i++) {
    assert.eq(i32[i], i);
}
for (let i = 5; i < 10; i++) {
    assert.eq(i32[i], i-5);
}
for (let i = 10; i < 15; i++) {
    assert.eq(i32[i], i-10);
}
for (let i = 15; i < 20; i++) {
    assert.eq(i32[i], i);
}

assert.throws(() => $1.exports.do_memcpy(0,16384-5,6), Error, "Out of bounds memory access (evaluating 'func(...args)')")
for (let i = 0; i < 5; i++) {
    assert.eq(i32[16384-5 + i], i);
}
