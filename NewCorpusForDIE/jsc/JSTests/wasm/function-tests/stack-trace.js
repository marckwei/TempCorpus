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

const builder = (new Builder())
    .Type().End()
    .Import()
        .Function("imp", "f", { params: [], ret: "void" })
    .End()
    .Function().End()
    .Export().Function("entry").End()
    .Code()
         // idx 1
        .Function("entry", {params: []})
            .Call(3)
        .End()
        // idx 2
        .Function({params: []})
            .Call(4)
        .End()
        // idx 3
        .Function({params: []})
            .Call(2)
        .End()
        // idx 4
        .Function({params: []})
            .Call(0)
        .End()
    .End();

let stacktrace;
let imp = () => {
    stacktrace = (new Error).stack;
}


const bin = builder.WebAssembly().get();
const module = new WebAssembly.Module(bin);
let instance = new WebAssembly.Instance(module, {imp: {f: imp}});
assert.falsy(stacktrace);
for (let i = 0; i < 10000; ++i) {
    instance.exports.entry();
    assert.truthy(stacktrace);
    stacktrace = stacktrace.split("\n");
    assert.truthy(stacktrace[0].indexOf("imp") !== -1); // the arrow function import named "imp".
    let found = false;
    for (let i = 0; i < stacktrace.length; ++i) {
        let str = stacktrace[i];
        if (str !== "<?>.wasm-function[4]@[wasm code]")
            continue;
        found = true;
        assert.eq(stacktrace[i + 1], "<?>.wasm-function[2]@[wasm code]");
        assert.eq(stacktrace[i + 2], "<?>.wasm-function[3]@[wasm code]");
        assert.eq(stacktrace[i + 3], "<?>.wasm-function[1]@[wasm code]");
    }
    assert.truthy(found);
    stacktrace = null;
}
