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

import Builder from '../Builder.js';
import * as assert from '../assert.js';

assert.throws(() => WebAssembly.Module.exports(undefined), TypeError, `WebAssembly.Module.exports called with non WebAssembly.Module argument`);
assert.eq(WebAssembly.Module.exports.length, 1);

{
    const m = new WebAssembly.Module((new Builder()).WebAssembly().get());
    assert.isArray(WebAssembly.Module.exports(m));
    assert.eq(WebAssembly.Module.exports(m).length, 0);
    assert.truthy(WebAssembly.Module.exports(m) !== WebAssembly.Module.exports(m));
}

{
    const m = new WebAssembly.Module(
        (new Builder())
            .Type().End()
            .Function().End()
            .Table()
                .Table({initial: 20, maximum: 30, element: "funcref"})
            .End()
            .Memory().InitialMaxPages(1, 1).End()
            .Global().I32(42, "immutable").End()
            .Export()
                .Function("func")
                .Table("tab", 0)
                .Memory("mem", 0)
                .Global("glob", 0)
            .End()
            .Code()
                .Function("func", { params: [] }).Return().End()
            .End()
            .WebAssembly().get());
    assert.eq(WebAssembly.Module.exports(m).length, 4);
    assert.eq(WebAssembly.Module.exports(m)[0].name, "func");
    assert.eq(WebAssembly.Module.exports(m)[0].kind, "function");
    assert.eq(WebAssembly.Module.exports(m)[1].name, "tab");
    assert.eq(WebAssembly.Module.exports(m)[1].kind, "table");
    assert.eq(WebAssembly.Module.exports(m)[2].name, "mem");
    assert.eq(WebAssembly.Module.exports(m)[2].kind, "memory");
    assert.eq(WebAssembly.Module.exports(m)[3].name, "glob");
    assert.eq(WebAssembly.Module.exports(m)[3].kind, "global");
}
