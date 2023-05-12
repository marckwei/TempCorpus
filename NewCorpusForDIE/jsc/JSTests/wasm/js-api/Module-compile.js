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

assert.isFunction(WebAssembly.compile);
assert.truthy(WebAssembly.hasOwnProperty('compile'));
assert.eq(WebAssembly.compile.length, 1);

async function testPromiseAPI() {
    {
        // Can't declare more than one memory.
        const builder = (new Builder())
            .Type().End()
            .Import().Memory("imp", "memory", {initial: 20}).End()
            .Function().End()
            .Memory().InitialMaxPages(1, 1).End()
            .Export().End()
            .Code()
            .End();

        try {
            await WebAssembly.compile(builder.WebAssembly().get());
        } catch(e) {
            assert.truthy(e instanceof WebAssembly.CompileError);
            assert.truthy(e.message === "WebAssembly.Module doesn't parse at byte 34: there can at most be one Memory section for now");
        }
    }

    {
        try {
            await WebAssembly.compile();
        } catch(e) {
            assert.truthy(e instanceof TypeError);
            assert.eq(e.message, "first argument must be an ArrayBufferView or an ArrayBuffer (evaluating 'WebAssembly.compile()')");
        }
    }

    {
        try {
            await WebAssembly.compile(20);
        } catch(e) {
            assert.truthy(e instanceof TypeError);
            assert.eq(e.message, "first argument must be an ArrayBufferView or an ArrayBuffer (evaluating 'WebAssembly.compile(20)')");
        }
    }

    {
        const builder = (new Builder())
            .Type().End()
            .Import().Memory("imp", "memory", {initial: 20}).End()
            .Function().End()
            .Export().End()
            .Code()
            .End();

        let module = await WebAssembly.compile(builder.WebAssembly().get());
        assert.truthy(module instanceof WebAssembly.Module);
    }
}

assert.asyncTest(testPromiseAPI());
