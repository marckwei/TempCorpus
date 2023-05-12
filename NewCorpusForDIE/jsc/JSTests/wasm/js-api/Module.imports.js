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

assert.throws(() => WebAssembly.Module.imports(undefined), TypeError, `WebAssembly.Module.imports called with non WebAssembly.Module argument`);
assert.eq(WebAssembly.Module.imports.length, 1);

{
    const m = new WebAssembly.Module((new Builder()).WebAssembly().get());
    assert.isArray(WebAssembly.Module.imports(m));
    assert.eq(WebAssembly.Module.imports(m).length, 0);
    assert.truthy(WebAssembly.Module.imports(m) !== WebAssembly.Module.imports(m));
}

{
    const m = new WebAssembly.Module(
        (new Builder())
            .Type().End()
            .Import()
                .Function("fooFunction", "barFunction", { params: [] })
                .Table("fooTable", "barTable", {initial: 20, element: "funcref"})
                .Memory("fooMemory", "barMemory", {initial: 20})
                .Global().I32("fooGlobal", "barGlobal", "immutable").End()
            .End()
            .WebAssembly().get());
    assert.eq(WebAssembly.Module.imports(m).length, 4);
    assert.eq(WebAssembly.Module.imports(m)[0].module, "fooFunction");
    assert.eq(WebAssembly.Module.imports(m)[0].name, "barFunction");
    assert.eq(WebAssembly.Module.imports(m)[0].kind, "function");
    assert.eq(WebAssembly.Module.imports(m)[1].module, "fooTable");
    assert.eq(WebAssembly.Module.imports(m)[1].name, "barTable");
    assert.eq(WebAssembly.Module.imports(m)[1].kind, "table");
    assert.eq(WebAssembly.Module.imports(m)[2].module, "fooMemory");
    assert.eq(WebAssembly.Module.imports(m)[2].name, "barMemory");
    assert.eq(WebAssembly.Module.imports(m)[2].kind, "memory");
    assert.eq(WebAssembly.Module.imports(m)[3].module, "fooGlobal");
    assert.eq(WebAssembly.Module.imports(m)[3].name, "barGlobal");
    assert.eq(WebAssembly.Module.imports(m)[3].kind, "global");
}
