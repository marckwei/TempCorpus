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

assert.isFunction(WebAssembly.instantiate);
assert.truthy(WebAssembly.hasOwnProperty('instantiate'));
assert.eq(WebAssembly.instantiate.length, 1);

{
    const builder = (new Builder())
          .Type().End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        let {module, instance} = await WebAssembly.instantiate(bin);
        assert.truthy(module instanceof WebAssembly.Module);
        assert.truthy(instance instanceof WebAssembly.Instance);
        assert.eq(instance.exports.foo(20), 1);
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        try {
            let {module, instance} = await WebAssembly.instantiate(bin, null);
        } catch(e) {
            assert.eq(e.message, "second argument to WebAssembly.instantiate must be undefined or an Object (evaluating 'WebAssembly.instantiate(bin, null)')");
        }
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .F32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        try {
            let {module, instance} = await WebAssembly.instantiate(bin);
        } catch(e) {
            assert.truthy(e instanceof WebAssembly.CompileError);
            assert.eq(e.message, "WebAssembly.Module doesn't validate: control flow returns with unexpected type. F32 is not a I32, in function at index 0");
        }
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Import().Memory("imp", "memory", {initial:100}).End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        try {
            let {module, instance} = await WebAssembly.instantiate(bin, {imp: {memory: 20}});
        } catch(e) {
            assert.eq(e.message, "Memory import imp:memory is not an instance of WebAssembly.Memory");
        }
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Import().Memory("imp", "memory", {initial:100}).End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        try {
            const module = new WebAssembly.Module(bin);
            let instance = await WebAssembly.instantiate(bin, {imp: {memory: 20}});
        } catch(e) {
            assert.eq(e.message, "Memory import imp:memory is not an instance of WebAssembly.Memory");
        }
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        let module = new WebAssembly.Module(bin);
        let instance = await WebAssembly.instantiate(module);
        assert.truthy(instance instanceof WebAssembly.Instance);
        assert.eq(instance.exports.foo(20), 1);
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Import().Memory("imp", "memory", {initial:100}).End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        try {
            await WebAssembly.instantiate(25);
        } catch(e) {
            // FIXME: Better error message here.
            assert.eq(e.message, "first argument must be an ArrayBufferView or an ArrayBuffer (evaluating 'WebAssembly.instantiate(25)')");
        }
    }

    assert.asyncTest(test());
}

{
    const builder = (new Builder())
          .Type().End()
          .Import().Memory("imp", "memory", {initial:100}).End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
              .Function("foo", { params: [], ret: "i32" })
                  .I32Const(1)
              .End()
          .End();

    const bin = builder.WebAssembly().get();

    async function test() {
        let module = new WebAssembly.Module(bin);
        let instance1 = await WebAssembly.instantiate(module, { imp: { memory: new WebAssembly.Memory({ initial: 100 }) } });
        assert.truthy(instance1 instanceof WebAssembly.Instance);
        let instance2 = await WebAssembly.instantiate(module, { imp: { memory: new WebAssembly.Memory({ initial: 100 }) } });
        assert.truthy(instance2 instanceof WebAssembly.Instance);
    }

    assert.asyncTest(test());
}
